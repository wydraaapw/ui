import { UtensilsCrossed } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-300 py-12 mt-auto border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                            <UtensilsCrossed className="h-6 w-6" />
                            <span>DobreSmaki</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Prawdziwa kuchnia, świeże składniki i pasja do gotowania.
                            Wpadnij do nas lub zamów z dostawą do domu.
                            Tworzymy smaki, które zostają w pamięci na dłużej.
                        </p>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                        <div className="text-center md:text-left">
                            <h4 className="font-bold text-white text-lg mb-4">Kontakt</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex flex-col md:flex-row items-center md:items-start gap-2">
                                    <span className="text-primary">📍</span>
                                    <span>ul. Smaczna 15, Warszawa</span>
                                </li>
                                <li className="flex flex-col md:flex-row items-center md:items-start gap-2">
                                    <span className="text-primary">📞</span>
                                    <span>+48 601 203 405</span>
                                </li>
                                <li className="flex flex-col md:flex-row items-center md:items-start gap-2">
                                    <span className="text-primary">✉️</span>
                                    <span>kontakt@dobresmaki.pl</span>
                                </li>
                                <li className="text-slate-500 mt-2">
                                    Otwarte: Pn-Nd 12:00 - 22:00
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
                <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} DobreSmaki. Wszelkie prawa zastrzeżone.
                </div>
            </div>
        </footer>
    );
};

export default Footer;