"use client";

export default function ModeSelector({ selected, onSelect }) {
    const cardBase = "group relative p-10 rounded-[32px] text-left transition-all duration-300 ease-out border md:h-full overflow-hidden";

    const getStyles = (isSelf) => {
        if (isSelf) {
            return "bg-[#FFFFFF] shadow-2xl ring-2 ring-[#D9CBBA] transform scale-[1.01] z-10";
        }
        return "bg-[#FFFFFF] shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#D9CBBA]/30 border border-transparent";
    };

    return (
        // Widened grid gap and max-width match parent
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 w-full">

            {/* Option 1: Fast Mode */}
            <button
                onClick={() => onSelect('fast')}
                className={`${cardBase} ${getStyles(selected === 'fast')}`}
            >
                <div className="flex flex-col items-start h-full">
                    <div className={`mb-6 p-4 rounded-full transition-colors ${selected === 'fast' ? 'bg-[#D9CBBA]/20 text-[#59514D]' : 'bg-[#F2F2F2] text-[#8C8480]'}`}>
                        <span className="text-3xl font-serif">⚡</span>
                    </div>
                    <h3 className="text-[28px] font-serif font-light text-[#0D0D0D] mb-3 tracking-tight">
                        Fast Prompt
                    </h3>
                    <p className="text-[17px] leading-[1.6] text-[#59514D] max-w-sm font-light">
                        Instant generation for clear, defined tasks.
                    </p>
                    <div className={`mt-auto pt-10 flex items-center text-[15px] uppercase tracking-[0.15em] font-medium transition-colors ${selected === 'fast' ? 'text-[#D9CBBA]' : 'text-[#8C8480] group-hover:text-[#D9CBBA]'}`}>
                        Select Mode <span className="ml-2 text-xl leading-none">›</span>
                    </div>
                </div>
            </button>

            {/* Option 2: Interactive Builder */}
            <button
                onClick={() => onSelect('interactive')}
                className={`${cardBase} ${getStyles(selected === 'interactive')}`}
            >
                <div className="flex flex-col items-start h-full">
                    <div className={`mb-6 p-4 rounded-full transition-colors ${selected === 'interactive' ? 'bg-[#D9CBBA]/20 text-[#59514D]' : 'bg-[#F2F2F2] text-[#8C8480]'}`}>
                        <span className="text-3xl font-serif">🧠</span>
                    </div>
                    <h3 className="text-[28px] font-serif font-light text-[#0D0D0D] mb-3 tracking-tight">
                        Interactive Builder
                    </h3>
                    <p className="text-[17px] leading-[1.6] text-[#59514D] max-w-sm font-light">
                        Guided refinement for vague or complex ideas.
                    </p>
                    <div className={`mt-auto pt-10 flex items-center text-[15px] uppercase tracking-[0.15em] font-medium transition-colors ${selected === 'interactive' ? 'text-[#D9CBBA]' : 'text-[#8C8480] group-hover:text-[#D9CBBA]'}`}>
                        Select Mode <span className="ml-2 text-xl leading-none">›</span>
                    </div>
                </div>
            </button>

        </div>
    );
}
