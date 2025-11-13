import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

export function Header() {
  return (
    <header className="py-6 px-4 container mx-auto relative z-20">
      <div className="flex justify-between items-center">
        <div className="font-bold text-2xl tracking-wider">
          <span className="highlight-yellow">FA</span>
          <span className="highlight-cyan">IZ</span>
          <span className="highlight-green">AN</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <Github className="mr-2" /> GitHub
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <Linkedin className="mr-2" /> LinkedIn
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <Mail className="mr-2" /> Mail
          </Button>
          <Button variant="outline" size="sm" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200">
            <FileText className="mr-2" /> Resume
          </Button>
        </div>
      </div>
    </header>
  );
}