import { useParams, useNavigate } from 'react-router-dom';
import ChatScreen from './ChatScreen';

export default function MessagesChatRoute() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const id = Number(propertyId);

  if (!id) return null;

  return (
    <ChatScreen
      propertyId={id}
      embedded
      onBack={() => navigate('/messages')}
    />
  );
}
