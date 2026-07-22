# VRM User-Supplied Model Verification

No VRM character asset is redistributed with LocalAITuber. Use a model that you
created or are licensed to use for the visual acceptance check.

1. Open Studio and choose **Load VRM**.
2. Select a non-empty `.vrm` file no larger than 100 MB.
3. Confirm the loading status changes to `VRM model ready` and the model appears.
4. Reload the page and confirm the selected model is restored from IndexedDB.
5. Verify neutral, wave, and confident poses; still and idle motion; and each
   emotion option.
6. Move the pointer over the model and verify eye/head look-at follows it, then
   leaves the pointer and returns to center.
7. Send an AI message. Confirm thinking pose activates before text arrives and
   the `aa` mouth expression animates while streamed text is being received.
8. Confirm transforms, lighting, and the transform lock update as documented.
9. Delete the selected model and confirm it disappears from the list and stage.

Failures are reported in the model status line. Browser developer tools should
show no credential, model upload, or third-party model request because model
bytes stay in local IndexedDB.
