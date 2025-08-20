export function useChatScroll() {
  const containerRef = ref<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (!containerRef.value) return;

    const container = containerRef.value;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  return { containerRef, scrollToBottom };
}
