const PREVIEW_KEYS = new Set(['slug', 'content', 'previewAt', 'publishedAt', 'message', 'proposalMessage', 'followUpMessage']);

export function clearPreviewData(lead) {
  return Object.fromEntries(Object.entries(lead).filter(([key]) => !PREVIEW_KEYS.has(key)));
}
