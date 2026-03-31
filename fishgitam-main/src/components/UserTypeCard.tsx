import { Card } from "@/components/ui/card";

interface UserTypeCardProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
}

const UserTypeCard = ({ title, imageSrc, imageAlt }: UserTypeCardProps) => {
  return (
    <Card className="bg-secondary p-8 rounded-3xl shadow-lg border-0 w-80 mx-auto flex flex-col items-center justify-center text-center">
      <h5 className="text-primary font-semibold text-lg mb-6">{title}</h5>
      <img 
        src={imageSrc} 
        alt={imageAlt}
        className="w-48 h-48 object-contain"
      />
    </Card>
  );
};

export default UserTypeCard;