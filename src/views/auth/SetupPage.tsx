import { Leaf, Settings, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const ENV_TEMPLATE = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Admin emails (comma-separated)
VITE_ADMIN_EMAILS=admin@nutrix.app`;

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ENV_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Nutrix Admin</h1>
          <p className="text-neutral-500 mt-1">Cấu hình Firebase để bắt đầu</p>
        </div>

        {/* Setup Card */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Chưa cấu hình Firebase</h2>
              <p className="text-sm text-neutral-500">Bạn cần thêm Firebase config vào file .env</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-medium text-neutral-900">Lấy Firebase Config</p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Vào <span className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">Firebase Console</span>
                  {' > '}Project Settings {' > '}General {' > '}Your apps {' > '}Web app config
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-medium text-neutral-900">Thêm vào file .env</p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Copy template bên dưới, điền giá trị thật, và dán vào file
                  {' '}<span className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">.env</span>
                  {' '}trong thư mục gốc dự án
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-medium text-neutral-900">Khởi động lại dev server</p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Dừng và chạy lại server để áp dụng biến môi trường mới
                </p>
              </div>
            </div>
          </div>

          {/* Env Template */}
          <div className="relative">
            <div className="bg-neutral-900 rounded-xl p-5 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre leading-relaxed">{ENV_TEMPLATE}</pre>
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-400" />
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-400 mt-4 text-center">
            Sau khi cấu hình xong, tải lại trang để tiếp tục.
          </p>
        </div>
      </div>
    </div>
  );
}
