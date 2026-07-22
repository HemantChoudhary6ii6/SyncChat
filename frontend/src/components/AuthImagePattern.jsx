const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md w-full text-center">
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 mb-8 overflow-hidden">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-base-300">
            <span className="size-2.5 rounded-full bg-error/60" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
            <span className="ml-2 text-xs text-base-content/40 font-medium">
              SyncChat
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[220px] justify-end">
            <div
              className="self-start max-w-[75%] bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2 text-sm opacity-0"
              style={{
                animation: "bubbleIn 6s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            >
              Hey! Are we still on for later?
            </div>

            <div
              className="self-end max-w-[75%] bg-primary text-primary-content rounded-2xl rounded-br-sm px-4 py-2 text-sm opacity-0"
              style={{
                animation: "bubbleIn 6s ease-in-out infinite",
                animationDelay: "1.4s",
              }}
            >
              Yes! Just finishing up now
            </div>

            <div
              className="self-start max-w-[75%] bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2 text-sm opacity-0"
              style={{
                animation: "bubbleIn 6s ease-in-out infinite",
                animationDelay: "2.6s",
              }}
            >
              Perfect, see you soon
            </div>

            <div
              className="self-start flex items-center gap-1 bg-base-200 rounded-2xl rounded-bl-sm px-4 py-2.5 opacity-0"
              style={{
                animation: "bubbleIn 6s ease-in-out infinite",
                animationDelay: "3.8s",
              }}
            >
              <span
                className="size-1.5 rounded-full bg-base-content/40"
                style={{
                  animation: "dotBounce 1s ease-in-out infinite",
                  animationDelay: "0s",
                }}
              />
              <span
                className="size-1.5 rounded-full bg-base-content/40"
                style={{
                  animation: "dotBounce 1s ease-in-out infinite",
                  animationDelay: "0.15s",
                }}
              />
              <span
                className="size-1.5 rounded-full bg-base-content/40"
                style={{
                  animation: "dotBounce 1s ease-in-out infinite",
                  animationDelay: "0.3s",
                }}
              />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>

      <style>{`
        @keyframes bubbleIn {
          0% { opacity: 0; transform: translateY(8px) scale(0.96); }
          8% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(0) scale(1); }
          95%, 100% { opacity: 0; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AuthImagePattern;