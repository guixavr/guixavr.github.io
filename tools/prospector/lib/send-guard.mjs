export function assertPreviewPublished(lead) {
  if (!lead?.slug || !lead.publishedAt) throw new Error('Publique a prévia antes de abrir o WhatsApp.');
}
