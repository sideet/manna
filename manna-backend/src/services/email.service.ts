import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface ConfirmationEmailData {
  participantName: string;
  participantEmail: string;
  hostName: string;
  meetingTitle: string;
  confirmedDate: string;
  confirmedTime: string;
  meetingLocation: string;
  joinLink: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const gmail = this.configService.get('gmail');

    if (!gmail?.user || !gmail?.appPassword) {
      console.warn('Gmail configuration is not complete. Email service will not work.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmail.user,
          pass: gmail.appPassword,
        },
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  private generateConfirmationEmailHtml(data: ConfirmationEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F86F7; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .schedule-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F86F7; }
    .schedule-item { margin: 8px 0; }
    .label { color: #666; }
    .link-button { display: inline-block; background-color: #4F86F7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>일정이 확정되었습니다</h1>
    </div>
    <div class="content">
      <p>안녕하세요, <strong>${data.participantName}</strong>님.</p>
      <p><strong>${data.hostName}</strong>님이 생성한 모임 "<strong>${data.meetingTitle}</strong>"의 일정이 확정되었습니다.</p>

      <div class="schedule-box">
        <h3>■ 확정된 일정</h3>
        <div class="schedule-item"><span class="label">날짜:</span> ${data.confirmedDate}</div>
        <div class="schedule-item"><span class="label">시간:</span> ${data.confirmedTime}</div>
        <div class="schedule-item"><span class="label">장소:</span> ${data.meetingLocation || '미정'}</div>
      </div>

      <p style="color: #666; font-size: 14px;">* 참여가 어려우시거나 변경이 필요하다면, 모임 생성자인 ${data.hostName}님께 직접 연락해 주세요.</p>

      <p>아래 링크를 클릭하여 확정된 일정을 다시 확인하실 수 있습니다.</p>
      <a href="${data.joinLink}" class="link-button">일정 확인하기</a>

      <div class="footer">
        <p>감사합니다.<br><strong>만나</strong> 드림</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private generateConfirmationEmailText(data: ConfirmationEmailData): string {
    return `
안녕하세요, ${data.participantName}님.
${data.hostName}님이 생성한 모임 "${data.meetingTitle}"의 일정이 확정되었습니다.

■ 확정된 일정
- 날짜: ${data.confirmedDate}
- 시간: ${data.confirmedTime}
- 장소: ${data.meetingLocation || '미정'}

* 참여가 어려우시거나 변경이 필요하다면, 모임 생성자인 ${data.hostName}님께 직접 연락해 주세요.

아래 링크를 클릭하여 확정된 일정을 다시 확인하실 수 있습니다.
${data.joinLink}

감사합니다.
만나 드림
    `.trim();
  }

  async sendConfirmationEmail(data: ConfirmationEmailData): Promise<boolean> {
    if (!this.transporter) {
      await this.initializeTransporter();
      if (!this.transporter) {
        console.error('Email transporter is not initialized');
        return false;
      }
    }

    const mailOptions = {
      from: `만나 <${this.configService.get('gmail.user')}>`,
      to: data.participantEmail,
      subject: `[만나] ${data.meetingTitle} 일정이 확정되었어요`,
      text: this.generateConfirmationEmailText(data),
      html: this.generateConfirmationEmailHtml(data),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}
