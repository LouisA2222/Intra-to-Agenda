import ical, { ICalCalendar, ICalEvent, ICalEventData } from "ical-generator";

async function createEvent(data: ICalEventData, calendar: string, timezone: string): Promise<ICalCalendar> {
    const cal = ical({
        name: calendar,
        timezone: timezone,
    });
    if (data == null) {
        return cal;
    }

    cal.createEvent(data);
    cal.save("data/event.ics");
    return cal;
}


export default createEvent;