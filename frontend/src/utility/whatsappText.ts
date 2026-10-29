export function formatWhatsAppText(text: unknown): string {
    const escaped = String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    return escaped.replace(/(\r\n|\n|\r)/g, '<br />').replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/~(.*?)~/g, '<del>$1</del>').replace(/```(.*?)```/g, '<code>$1</code>').replace(/`(.*?)`/g, '<code>$1</code>')
}
