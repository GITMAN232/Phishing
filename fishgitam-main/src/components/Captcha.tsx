import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  captchaInput: string;
  onCaptchaInputChange: (value: string) => void;
  error?: string;
}

const Captcha = ({ captchaInput, onCaptchaInputChange, error }: CaptchaProps) => {
  const generateCaptcha = () => {
    const digits = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
    const rotations = Array.from({ length: 5 }, () => Math.floor(Math.random() * 40) - 20);
    return { digits, rotations };
  };

  const [captchaData, setCaptchaData] = useState(generateCaptcha);

  const captchaValue = captchaData.digits;

  const refreshCaptcha = () => {
    setCaptchaData(generateCaptcha());
    onCaptchaInputChange("");
  };

  return (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground font-medium">CAPTCHA</label>
      <div className="flex items-center justify-center gap-2">
        {/* CAPTCHA Display Box */}
        <div className="border-2 border-dashed border-border p-3 bg-background min-w-[120px] h-12 flex items-center select-none">
          <div className="flex items-center w-full justify-between">
            {captchaValue.split('').map((char, index) => (
              <span
                key={`${captchaValue}-${index}`}
                className="font-medium text-foreground inline-block text-2xl"
                style={{
                  transform: `rotate(${captchaData.rotations[index]}deg)`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          type="button"
          onClick={refreshCaptcha}
          className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded flex-shrink-0 w-10 h-10 flex items-center justify-center"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
        
        {/* Input Field */}
        <input
          type="text"
          value={captchaInput}
          onChange={(e) => onCaptchaInputChange(e.target.value)}
          placeholder="Enter CAPTCHA"
          className="text-center py-2 border-0 border-b border-border bg-transparent focus:outline-none focus:border-primary placeholder-muted-foreground min-w-[100px]"
          maxLength={5}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
};

export default Captcha;
