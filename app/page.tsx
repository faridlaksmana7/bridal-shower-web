import { Experience } from "@/components/experience";
import { event } from "@/src/data/event";

export default function Home() {
  const eventData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Pinky Promise — Bridal Shower",
    description: "A little pink, a lot of love, one forever promise.",
    startDate: event.dateISO,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventData) }}
      />
      <Experience />
    </>
  );
}
