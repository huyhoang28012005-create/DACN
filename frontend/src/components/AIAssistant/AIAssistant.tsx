import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export interface BookingData {
  id: number;
  status: string;
  [key: string]: any;
}

export interface EquipmentData {
  id: number;
  name: string;
  status: string;
  [key: string]: any;
}

interface AIAssistantProps {
  userRole: string;
  bookings?: BookingData[];
  equipment?: EquipmentData[];
  onAction: (actionName: string, payload?: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  content: React.ReactNode;
}

export function AIAssistant({ userRole, bookings = [], equipment = [], onAction }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', content: 'Xin chào! Tôi là Trợ lý LabBook. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const processAICommand = (query: string, role: string): React.ReactNode => {
    const text = query.toLowerCase();
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    // 1. Phân tích ngày tháng (nếu có) ví dụ: ngày 06/06, 6-6
    const dateMatch = text.match(/(?:ngày|hôm|vào) ?(\d{1,2})[\/\-](\d{1,2})/);
    let targetDateStr = '';
    let filteredBookings = bookings;
    
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      targetDateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
      
      // Lọc booking theo ngày
      filteredBookings = bookings.filter(b => {
        if (!b.start_time) return false;
        const d = new Date(b.start_time);
        return d.getDate() === day && (d.getMonth() + 1) === month;
      });
    }

    // 2. Các lệnh dành cho Admin
    if (isAdmin) {
      if (/thống kê|báo cáo|tổng quan|tình hình/.test(text)) {
        const availableEquip = equipment.filter(e => e.status === 'AVAILABLE').length;
        const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
        return (
          <div className="space-y-1">
            <p>📊 <strong>Thống kê nhanh:</strong></p>
            <ul className="list-disc pl-4 text-sm">
              <li>Thiết bị rảnh: <strong>{availableEquip}</strong></li>
              <li>Đơn đang chờ duyệt: <strong>{pendingBookings}</strong></li>
            </ul>
          </div>
        );
      }
      
      if (/duyệt tất cả|phê duyệt hết|chấp nhận tất cả/.test(text)) {
        onAction('approve-all');
        return '✅ Đã gửi lệnh phê duyệt tất cả các đơn chờ!';
      }
      
      const cancelMatch = text.match(/hủy (?:booking|đơn|lịch) (\d+)/);
      if (cancelMatch || (/hủy/.test(text) && /(?:booking|đơn|lịch)/.test(text))) {
        if (cancelMatch && cancelMatch[1]) {
          const id = parseInt(cancelMatch[1], 10);
          onAction('cancel-booking', { id });
          return `⏳ Đang gửi lệnh hủy đơn số #${id}...`;
        }
        return 'Vui lòng cung cấp chính xác ID đơn cần hủy. Ví dụ: hủy đơn 12';
      }
    } else {
      // 3. Nếu Student cố dùng lệnh Admin
      if (/thống kê|duyệt tất cả|phê duyệt/.test(text)) {
        return '❌ Bạn không có quyền quản trị để thực hiện lệnh này.';
      }
    }

    // 4. Các lệnh chung (Cả Admin và Student đều dùng được)
    
    // Tìm thiết bị cụ thể
    const equipMatch = text.match(/tìm(?: kiếm)? thiết bị (.*)/);
    if (equipMatch || (text.includes('tìm') && text.includes('thiết bị'))) {
      if (equipMatch && equipMatch[1]) {
        const keyword = equipMatch[1].trim();
        const found = equipment.filter(e => e.name.toLowerCase().includes(keyword));
        if (found.length === 0) return `Không tìm thấy thiết bị nào chứa từ khóa "${keyword}".`;
        return (
          <div>
            <p>🔍 Tìm thấy {found.length} thiết bị:</p>
            <ul className="list-disc pl-4 text-sm mt-1">
              {found.slice(0, 5).map(e => (
                <li key={e.id}>{e.name} - {e.status}</li>
              ))}
              {found.length > 5 && <li className="text-gray-500 text-xs mt-1">...và {found.length - 5} thiết bị khác</li>}
            </ul>
          </div>
        );
      }
      return 'Vui lòng nhập tên thiết bị. Ví dụ: tìm thiết bị máy tính';
    }

    // Thiết bị rảnh
    if (/thiết bị/.test(text) && /rảnh|trống|có sẵn/.test(text)) {
      const availableEquip = equipment.filter(e => e.status === 'AVAILABLE').slice(0, 5);
      if (availableEquip.length === 0) return 'Hiện không có thiết bị nào đang rảnh.';
      return (
        <div>
          <p>💡 Top 5 thiết bị đang rảnh:</p>
          <ul className="list-disc pl-4 text-sm mt-1">
            {availableEquip.map(e => (
              <li key={e.id}>{e.name}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Xem lịch / đơn đặt phòng
    if (/lịch|đơn|booking/.test(text)) {
      // Nếu có filter theo ngày
      const targetBookings = filteredBookings.slice(0, 5); 
      
      const prefix = targetDateStr ? `📅 Lịch đặt trong ngày ${targetDateStr}:` : `📅 Các lịch đặt gần đây của bạn:`;
      
      if (targetBookings.length === 0) {
        return targetDateStr ? `Không có lịch đặt nào trong ngày ${targetDateStr}.` : 'Bạn không có lịch đặt nào gần đây.';
      }
      
      return (
        <div>
          <p>{prefix}</p>
          <ul className="list-disc pl-4 text-sm mt-1">
            {targetBookings.map(b => {
               const timeStr = b.start_time ? new Date(b.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
               return (
                 <li key={b.id}>
                   Đơn #{b.id} {timeStr ? `- ${timeStr}` : ''} ({b.status})
                 </li>
               );
            })}
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p>Xin lỗi, tôi chưa hiểu rõ ý bạn. Hãy thử các mẫu câu:</p>
        <ul className="list-disc pl-4 text-sm text-[#757575]">
          {isAdmin && <li>"Thống kê tổng quan"</li>}
          <li>"Xem lịch ngày 06/06"</li>
          <li>"Các thiết bị đang rảnh"</li>
          <li>"Tìm thiết bị [tên]"</li>
        </ul>
      </div>
    );
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Giả lập AI thinking
    setTimeout(() => {
      const responseContent = processAICommand(currentInput, userRole);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: responseContent
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-[#1E5FA5] hover:bg-[#154a85] text-white rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center justify-center animate-bounce-short"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-xl shadow-2xl border border-[#E0E0E0] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1E5FA5] text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">Trợ lý AI LabBook</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 bg-[#F9FAFB]">
        <div className="space-y-4 pr-3" ref={scrollRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-[14px] ${
                msg.sender === 'user' 
                  ? 'bg-[#1E5FA5] text-white rounded-br-sm' 
                  : 'bg-white text-[#212121] border border-[#E0E0E0] rounded-bl-sm shadow-sm'
              }`}>
                {msg.sender === 'ai' && <div className="flex items-center gap-1 mb-1 text-[#757575] text-xs font-medium"><Bot className="w-3 h-3"/> AI Assistant</div>}
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#E0E0E0]">
        <form 
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Nhập lệnh (vd: thống kê)..."
            className="flex-1 bg-[#F5F5F5] border border-transparent focus:bg-white focus:border-[#1E5FA5] rounded-full px-4 py-2 text-[14px] outline-none transition-colors"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 bg-[#1E5FA5] text-white rounded-full hover:bg-[#154a85] disabled:opacity-50 disabled:hover:bg-[#1E5FA5] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
