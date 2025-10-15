interface NavbarProps {
	onHome: () => void;
}

function Navbar({ onHome }: NavbarProps) {
	return (
		<nav className="w-full backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/40 shadow-2xl sticky top-0 z-20">
			<div className="px-6 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2.5 cursor-pointer group" onClick={onHome}>
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-blue-900/50 transition-all">
						MS
					</div>
					<span className="text-base font-extrabold text-slate-100">Meeting Summarizer</span>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
