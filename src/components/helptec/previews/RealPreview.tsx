import { useState } from "react";
import { getPreviewImage } from "./previewImages";

interface RealPreviewProps {
  category: string;
  segment?: string;
  name: string;
}

const RealPreview = ({ category, segment, name }: RealPreviewProps) => {
  const [loaded, setLoaded] = useState(false);
  const imageSrc = getPreviewImage(category, name, segment);

  return (
    <div className="w-full h-full absolute inset-0 pt-6 overflow-hidden">
      {/* Animated scrolling image */}
      <div className="relative w-full animate-preview-scroll" style={{ minHeight: "220%" }}>
        <img
          src={imageSrc}
          alt={`Preview ${name}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-auto object-cover object-top transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          width={800}
          height={600}
        />
        {/* Duplicate for seamless scroll loop */}
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className={`w-full h-auto object-cover object-top mt-1 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          width={800}
          height={600}
        />
      </div>

      {/* Shimmer loading state */}
      {!loaded && (
        <div className="absolute inset-0 pt-6">
          <div className="w-full h-full bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 animate-pulse rounded" />
        </div>
      )}

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {/* Subtle reflection glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/60 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default RealPreview;
