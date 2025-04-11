
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  authorAvatar?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
  // Format the date nicely
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{announcement.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{announcement.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={announcement.authorAvatar} />
            <AvatarFallback>{announcement.author[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{announcement.author}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(announcement.date)}
        </span>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementCard;
