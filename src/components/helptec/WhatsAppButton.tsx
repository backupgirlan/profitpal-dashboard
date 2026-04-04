import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const handleClick = () => {
    const link = document.createElement("a");
    link.href = "https://wa.me/5575999401616?text=Olá! Gostaria de solicitar um orçamento.";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[hsl(142,71%,45%)] text-primary-foreground flex items-center justify-center shadow-lg animate-pulse-neon hover:scale-110 transition-transform duration-300 cursor-pointer"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
};

export default WhatsAppButton;
