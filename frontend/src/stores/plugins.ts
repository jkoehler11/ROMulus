import { defineStore } from "pinia";
import { ref } from "vue";
import type { PluginSchema, StorePluginSchema } from "@/__generated__";
import pluginApi from "@/services/api/plugin";

/** The plugins installed beside the library, and the actions they add.
 *
 * Read once per session: the shelf is on the server's disk, so it cannot
 * change between two page loads of the same session that the user could act
 * on. A failed read leaves an empty list, which hides the actions rather than
 * offering buttons that cannot open. Installing and removing are the two things
 * that do change it, so both re-read the shelf. */
export const usePluginStore = defineStore("plugins", () => {
  const plugins = ref<PluginSchema[]>([]);
  const loaded = ref(false);
  const store = ref<StorePluginSchema[]>([]);
  const storeLoaded = ref(false);
  // Reading the index is not the same as having read it: until the first reply
  // arrives the list is empty because nothing has been asked for yet.
  const storeLoading = ref(false);
  // Each plugin's saved values, keyed by plugin id. Actions are expanded from
  // these, so they load with the shelf rather than when a form is opened.
  const values = ref<Record<string, Record<string, unknown>>>({});

  // A read in flight is shared: several components ask for the shelf as they
  // mount, and that is one request, not one each.
  let pending: Promise<void> | null = null;

  async function load(): Promise<void> {
    if (loaded.value) return;
    pending ??= reload().finally(() => {
      pending = null;
    });
    await pending;
  }

  async function reload(): Promise<void> {
    try {
      const listed = (await pluginApi.getPlugins()).data;
      // Anything that is not a list is an answer we cannot read, and a store
      // with no plugins is what that leaves the page with.
      plugins.value = Array.isArray(listed) ? listed : [];
      loaded.value = true;
    } catch {
      // A read that failed is not a read: the shell asks before anyone has
      // signed in, and latching that empty answer would hide every plugin for
      // the rest of the session. Leave it unloaded so the next ask retries.
      plugins.value = [];
    }
    await loadSettings();
  }

  /** Forget what was read, for a sign-out: the shelf is instance-wide but the
   *  saved values belong to the user who was signed in. */
  function forget(): void {
    loaded.value = false;
    plugins.value = [];
    values.value = {};
  }

  /** Every plugin's values. A plugin with none gets its manifest's defaults,
   *  which is what the server answers anyway; a failed read leaves it empty so
   *  its gated actions stay hidden rather than appearing unconfigured. */
  async function loadSettings(): Promise<void> {
    const known = Array.isArray(plugins.value) ? plugins.value : [];
    const entries = await Promise.all(
      known.map(async (plugin) => {
        try {
          const reply = await pluginApi.getSettings(plugin.id);
          return [plugin.id, reply.data?.values ?? {}] as const;
        } catch {
          return [plugin.id, {}] as const;
        }
      }),
    );
    values.value = Object.fromEntries(entries);
  }

  function settingsFor(pluginId: string): Record<string, unknown> {
    return values.value[pluginId] ?? {};
  }

  /** Install from a URL the server fetches, or a manifest the user pasted. The
   * message is the server's own reason, so the dialog can show it. */
  async function install(source: {
    url?: string;
    manifest?: object;
  }): Promise<{ ok: boolean; message?: string }> {
    try {
      await pluginApi.addPlugin(source);
    } catch (error) {
      return { ok: false, message: refusal(error) };
    }
    await reload();
    return { ok: true };
  }

  /** Install one the curated index lists. */
  async function installFromStore(
    pluginId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      await pluginApi.installFromStore(pluginId);
    } catch (error) {
      return { ok: false, message: refusal(error) };
    }
    await reload();
    return { ok: true };
  }

  /** The index itself, read when the store tab is first opened. */
  async function loadStore(fresh = false): Promise<string | null> {
    // `fresh` is the reader asking again: the index is remote, and a store that
    // was wrong a minute ago may have been fixed since.
    if (storeLoaded.value && !fresh) return null;
    storeLoaded.value = true;
    storeLoading.value = true;
    try {
      store.value = (await pluginApi.getStore()).data ?? [];
    } catch (error) {
      storeLoaded.value = false;
      return refusal(error);
    } finally {
      storeLoading.value = false;
    }
    return null;
  }

  async function remove(
    pluginId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      await pluginApi.deletePlugin(pluginId);
    } catch (error) {
      return { ok: false, message: refusal(error) };
    }
    await reload();
    return { ok: true };
  }

  async function settings(
    pluginId: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const reply = await pluginApi.getSettings(pluginId);
      values.value = {
        ...values.value,
        [pluginId]: reply.data?.values ?? {},
      };
      return reply.data?.values ?? {};
    } catch {
      return null;
    }
  }

  async function saveSettings(
    pluginId: string,
    draftValues: Record<string, unknown>,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      await pluginApi.saveSettings(pluginId, draftValues);
    } catch (error) {
      return { ok: false, message: refusal(error) };
    }
    values.value = { ...values.value, [pluginId]: { ...draftValues } };
    return { ok: true };
  }

  return {
    plugins,
    loaded,
    store,
    storeLoaded,
    storeLoading,
    values,
    settingsFor,
    load,
    reload,
    forget,
    install,
    installFromStore,
    loadStore,
    remove,
    settings,
    saveSettings,
  };
});

/** The server's explanation for a refused install or removal, when it gave one. */
function refusal(error: unknown): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  // FastAPI answers a request that does not fit its model with a list of
  // messages, one per field. The first is the one that names the problem, and
  // saying it beats a sentence that says nothing.
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0] as { msg?: unknown; loc?: unknown };
    if (typeof first?.msg === "string") {
      const where = Array.isArray(first.loc) ? first.loc.join(".") : "";
      return where ? `${where}: ${first.msg}` : first.msg;
    }
  }
  return "The server refused that plugin.";
}
