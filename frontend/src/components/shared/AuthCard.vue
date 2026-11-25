<script setup lang="ts">
// AuthCard: the translucent card frame used by every auth view
// (Login / Register / ResetPassword / Setup). Wraps RCard, the logo,
// and the padded inner column. Views drop their form content into the
// default slot.
import { RCard, RImage } from "@/lib";
import { PRODUCT_NAME, SOURCE_REPO, SOURCE_REPO_URL } from "@/brand";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <RCard v-bind="$attrs" class="auth-card" variant="elevated" elevation="4">
    <div class="auth-card__inner">
      <RImage
        src="/assets/isotipo.svg"
        :width="80"
        class="auth-card__logo"
        :alt="PRODUCT_NAME"
      />
      <slot />
      <a
        class="auth-card__terms"
        :href="SOURCE_REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        AGPL-3.0 · {{ SOURCE_REPO }}
      </a>
    </div>
  </RCard>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 440px;
  /* Flex item in the centred auth stage: allow it to shrink below its
     content's min width on phones narrower than the card, so it never spills
     past the viewport. */
  min-width: 0;
  border-radius: var(--r-radius-lg) !important;
  box-shadow: var(--r-elev-4) !important;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--r-color-canvas-bg-deep) 65%, transparent) 0%,
    color-mix(in srgb, var(--r-color-canvas-bg-deep) 65%, transparent) 100%
  );
}

.auth-card__inner {
  padding: var(--r-space-8) var(--r-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--r-space-4);
}

/* The licence and the source belong on the one screen a visitor sees before
   signing in: the AGPL asks a network service to offer them its source. */
.auth-card__terms {
  align-self: center;
  color: var(--r-color-fg-muted);
  font-size: 11px;
  text-decoration: none;
}
.auth-card__terms:hover,
.auth-card__terms:focus-visible {
  color: var(--r-color-fg);
  text-decoration: underline;
}

.auth-card__logo {
  margin: 0 auto var(--r-space-2);
  filter: drop-shadow(
    0 0 16px color-mix(in srgb, var(--r-color-brand-primary) 30%, transparent)
  );
}
</style>
