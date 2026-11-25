# Security Policy

ROMulus is RomM with a plugin system on top. Thank you for helping keep it, and
the instances people run with it, safe.

## Reporting a vulnerability

**Do not open a public issue, discussion, pull request, or chat message about a
security problem.** Use GitHub's private vulnerability reporting:

- **[Report it here](https://github.com/jkoehler11/ROMulus/security/advisories/new)** for anything in this fork: the plugin system (install, reading the
  shelf, panels, settings), the plugin routes, the settings page, this
  repository's CI, or the published image.

Most of this code is RomM's. If the problem is in that part (scanning, auth,
saves and sync, the player, metadata providers), please also report it to
upstream at <https://github.com/rommapp/romm/security/advisories/new>: they own
that code, fix it there, and the fix reaches every RomM and ROMulus instance on
the next release merge. Reporting it in both places is welcome; reporting it
only upstream still gets it fixed here.

## What to include

- The type of issue (permission bypass, remote code execution, SSRF, path
  traversal, credential exposure, and so on)
- Full paths of the source files involved
- The tag, branch, commit or image digest you were running
- Any configuration needed to reproduce it
- Step-by-step reproduction, and a proof of concept if you have one
- The impact, including how an attacker would use it

## Supported versions

The fork builds images from `main`, and a fix lands in the next image built from
it. Older tags are not patched; update to the current image before reporting,
and say which commit or digest you tested.

## The plugin boundary

Plugins are declarative by design: a manifest on disk describes buttons that open
a URL, and nothing in a plugin folder runs on the server. A report that shows a
plugin making the server run code, reach a private address, escape its folder, or
have a setting rendered unescaped is exactly the kind of security issue this fork
wants to hear about.
