// The version to display and where it links: the branch on a dev build when
// known, the commit on a nightly build (`nightly-<short sha>`), else the
// releases page. Both point at this fork, which is where its builds come from:
// a tag is a ROMulus release, not one of upstream's.
import { computed } from "vue";
import { SOURCE_REPO } from "@/brand";
import storeHeartbeat from "@/stores/heartbeat";

const NIGHTLY_VERSION_RE = /^nightly-([0-9a-f]{7,40})$/;

export function useVersionDisplay() {
  const heartbeatStore = storeHeartbeat();

  const branch = computed(() => {
    const { VERSION, GIT_BRANCH } = heartbeatStore.value.SYSTEM;
    return VERSION === "development" ? GIT_BRANCH : null;
  });

  const version = computed(
    () => branch.value ?? heartbeatStore.value.SYSTEM.VERSION,
  );

  const href = computed(() => {
    // Branch names commonly contain "/" (e.g. "feature/foo"), which GitHub
    // expects as literal path separators, so encode each segment on its own.
    const encodedBranch = branch.value
      ?.split("/")
      .map(encodeURIComponent)
      .join("/");
    if (encodedBranch) {
      return `https://github.com/${SOURCE_REPO}/tree/${encodedBranch}`;
    }
    const nightlyCommit = NIGHTLY_VERSION_RE.exec(version.value)?.[1];
    // A build reports its tag without the "v" the release carries, so a tag URL
    // would 404; the releases page always resolves.
    return nightlyCommit
      ? `https://github.com/${SOURCE_REPO}/commit/${nightlyCommit}`
      : `https://github.com/${SOURCE_REPO}/releases`;
  });

  return { version, href };
}
