import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AiChatContext } from './ai-chat.controller';

@Injectable()
export class AiChatService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async chat(
    message: string,
    role: string,
    context: AiChatContext,
  ): Promise<{ reply: string; action?: string | null; payload?: unknown }> {
    if (!this.ai) {
      return {
        reply:
          'Hệ thống chưa được cấu hình GEMINI_API_KEY trong file .env. Vui lòng liên hệ Admin để thêm API Key nhé!',
        action: null,
      };
    }

    const systemInstruction = `
Bạn là Trợ lý học vụ AI cao cấp của hệ thống LabBook (Quản lý Phòng Thí nghiệm - Đại học Việt Nhật VJU).
Người dùng đang giao tiếp với bạn có vai trò (Role) là: ${role}.

[NGỮ CẢNH HỆ THỐNG HIỆN TẠI]
- Danh sách thiết bị: ${JSON.stringify(context?.equipment?.map((e: { id: number; name: string; status: string }) => ({ id: e.id, name: e.name, status: e.status })) || [])}
- Đơn đặt phòng/thiết bị gần đây: ${JSON.stringify(context?.bookings?.slice(0, 5) || [])}

[QUY TẮC GIAO TIẾP VÀ VĂN PHONG]
1. Xưng hô: 
   - Nếu role là "ADMIN" hoặc "INSTRUCTOR": Xưng "Em/Mình" và gọi là "Thầy/Cô". Thể hiện thái độ kính trọng, hỗ trợ nghiệp vụ quản lý.
   - Nếu role là "STUDENT": Xưng "Mình/Trợ lý LabBook" và gọi là "Bạn/Sinh viên". Thể hiện thái độ nhiệt tình, mang tính sư phạm và hướng dẫn.
2. Văn phong: Lịch sự, ngắn gọn, súc tích, mang đậm chất học thuật khoa học (Sử dụng đúng thuật ngữ chuyên ngành Hóa học/Sinh học/IT nếu được hỏi).
3. Kiến thức: Nếu người dùng hỏi về quy định an toàn phòng Lab, tính chất hóa chất, hoặc cách sử dụng thiết bị cơ bản, hãy kết hợp kiến thức khoa học của bạn để trả lời thật chính xác.
4. Trình bày: Sử dụng bullet points (-), in đậm (**text**) để câu trả lời dễ đọc.

[HỖ TRỢ THỰC THI LỆNH (SYSTEM ACTIONS)]
Nếu người dùng yêu cầu thao tác trên hệ thống, bạn ra lệnh cho Frontend bằng cách trả về trường "action":
- Duyệt tất cả đơn chờ (CHỈ DÀNH CHO ADMIN): "action": "approve-all"
- Duyệt 1 đơn cụ thể số X (CHỈ DÀNH CHO ADMIN): "action": "approve-booking", "payload": { "id": X }
- Hủy/Từ chối đơn số X: "action": "cancel-booking", "payload": { "id": X }

PHẢI TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON (Tuyệt đối không bọc bằng dấu \`\`\`json):
{
  "reply": "Câu trả lời giao tiếp của bạn theo đúng văn phong",
  "action": "approve-all" | "approve-booking" | "cancel-booking" | null,
  "payload": { "id": 123 } // hoặc null
}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return { reply: 'Xin lỗi, tôi không thể phản hồi lúc này.' };

      const parsed = JSON.parse(text) as {
        reply: string;
        action?: string | null;
        payload?: unknown;
      };
      return parsed;
    } catch (error) {
      console.error('Gemini API Error:', (error as Error).message);
      return {
        reply:
          'Xin lỗi, não bộ AI của tôi đang gặp chút sự cố kết nối. Hãy thử lại sau nhé!',
      };
    }
  }
}
