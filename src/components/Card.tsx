interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`rounded-lg p-4 bg-white shadow-lg ${className} w-full`}>
      {children}
    </div>
  );
};

export default Card;