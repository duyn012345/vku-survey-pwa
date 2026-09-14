export default function Notification({
  message,
  type = "info"
}) {

  if (!message) {
    return null;
  }


  return (
    <div
      className={`notification ${type}`}
    >
      {message}
    </div>
  );
}
