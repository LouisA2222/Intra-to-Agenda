import { ICalCalendar } from 'ical-generator';
import nodemailer from 'nodemailer';
import * as fs from 'fs';

async function sendEventByEmail(event: ICalCalendar, email: string) {
    const starttls = true;
    const transporter = nodemailer.createTransport({
        service: 'smtp',
        port: parseInt(process.env.SENDER_PORT as string),
        host: process.env.SENDER_SMTP as string,
        secure: false,
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD,
        }
    });
    const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'New event on the intranet',
        text: 'New event on the intranet' + '\n' + 'See the attached file.',
        icalEvent: {
            filename: 'event.ics',
            method: 'request',
            content: fs.readFileSync('data/event.ics').toString(),
        }
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent.');
        }
    });
}

export default sendEventByEmail;