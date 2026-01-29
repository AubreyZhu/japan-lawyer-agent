export const metadata = {
  title: "日本律师智能体（百炼）",
  description: "Password protected web chat for a Bailian agent app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, background: "#fafafa" }}>{children}</body>
    </html>
  );
}
