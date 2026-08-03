"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, Calendar, CheckCircle, CreditCard, FileText, GraduationCap, Home, Bell, Library, X, User, Award, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchStudentData, searchFacultyData } from "@/actions/search";

const iconMap = {
  Home, BookOpen, Calendar, CheckCircle, FileText, GraduationCap, CreditCard, Library, Bell, User, Award, Users
};

const STATIC_PAGES = [
  // Student
  { id: "page-dashboard-s", type: "Page", role: "student", title: "Dashboard", subtitle: "Overview of your academic profile", href: "/student/dashboard", icon: "Home" },
  { id: "page-courses-s", type: "Page", role: "student", title: "My Courses", subtitle: "View enrolled courses and materials", href: "/student/courses", icon: "BookOpen" },
  { id: "page-timetable-s", type: "Page", role: "student", title: "Timetable", subtitle: "Your class schedule", href: "/student/timetable", icon: "Calendar" },
  { id: "page-attendance-s", type: "Page", role: "student", title: "Attendance", subtitle: "View your attendance records", href: "/student/attendance", icon: "CheckCircle" },
  { id: "page-assignments-s", type: "Page", role: "student", title: "Assignments", subtitle: "View and submit assignments", href: "/student/assignments", icon: "FileText" },
  { id: "page-grades-s", type: "Page", role: "student", title: "Grades & Results", subtitle: "View your academic performance", href: "/student/grades", icon: "GraduationCap" },
  { id: "page-fees-s", type: "Page", role: "student", title: "Fees", subtitle: "Manage your fee payments", href: "/student/fees", icon: "CreditCard" },
  { id: "page-library-s", type: "Page", role: "student", title: "Library", subtitle: "Manage borrowed books and fines", href: "/student/library", icon: "Library" },
  { id: "page-announcements-s", type: "Page", role: "student", title: "Announcements", subtitle: "University news and notices", href: "/student/announcements", icon: "Bell" },
  { id: "page-notifications-s", type: "Page", role: "student", title: "Notifications", subtitle: "Your recent alerts", href: "/student/notifications", icon: "Bell" },
  
  // Faculty
  { id: "page-dashboard-f", type: "Page", role: "faculty", title: "Dashboard", subtitle: "Overview of your faculty profile", href: "/faculty/dashboard", icon: "Home" },
  { id: "page-courses-f", type: "Page", role: "faculty", title: "My Courses", subtitle: "View your assigned courses", href: "/faculty/courses", icon: "BookOpen" },
  { id: "page-attendance-f", type: "Page", role: "faculty", title: "Attendance", subtitle: "Manage student attendance", href: "/faculty/attendance", icon: "CheckCircle" },
  { id: "page-assignments-f", type: "Page", role: "faculty", title: "Assignments", subtitle: "Manage course assignments", href: "/faculty/assignments", icon: "FileText" },
  { id: "page-grades-f", type: "Page", role: "faculty", title: "Grades", subtitle: "Grade student submissions", href: "/faculty/grades", icon: "Award" },

  // Admin
  { id: "page-dashboard-a", type: "Page", role: "university_admin", title: "Admin Dashboard", subtitle: "Overview of institutional operations", href: "/admin/dashboard", icon: "Home" },
  { id: "page-students-a", type: "Page", role: "university_admin", title: "Student Management", subtitle: "Manage enrolled students", href: "/admin/students", icon: "Users" },
];

export function GlobalSearch({ role }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(-1);
      return;
    }

    const searchLower = query.toLowerCase();
    
    // 1. Local Search (Static Pages)
    const staticResults = STATIC_PAGES.filter(p => 
      p.role === role && 
      (p.title.toLowerCase().includes(searchLower) || p.subtitle.toLowerCase().includes(searchLower))
    );
    
    // Optimistically show static results immediately
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults(staticResults);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(-1);

    // 2. Debounced Dynamic Search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const dynamicResults = role === "student" 
            ? await searchStudentData(query)
            : await searchFacultyData(query);
          
          setResults([...staticResults, ...dynamicResults]);
        } catch (err) {
          console.error("Search Action Error:", err);
        }
      });
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, role]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (result) => {
    setIsOpen(false);
    setQuery("");
    router.push(result.href);
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {});

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative flex items-center group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          type="text"
          placeholder="Search CampusOS..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-10 appearance-none bg-secondary/60 hover:bg-secondary/90 dark:bg-secondary dark:hover:bg-secondary/90 border-transparent focus-visible:bg-background dark:focus-visible:bg-card pl-9 pr-10 shadow-none transition-all duration-200 rounded-full focus-visible:ring-1 focus-visible:border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-full"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setResults([]);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[450px] max-w-[calc(100vw-32px)] max-h-[80vh] overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-lg z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
          {isPending && results.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-3 text-primary" />
              <span className="text-sm font-medium">Searching across CampusOS...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 flex flex-col items-center text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mb-3 text-muted-foreground/50" />
              <p className="font-medium text-foreground">No results found</p>
              <p className="mt-1">We couldn&apos;t find anything matching &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.keys(groupedResults).map((type) => (
                <div key={type} className="flex flex-col">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted/30 mx-1 rounded-md mb-1">
                    {type}
                  </div>
                  <div className="space-y-0.5">
                    {groupedResults[type].map((result, idx) => {
                      const globalIndex = results.findIndex((r) => r.id === result.id);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = iconMap[result.icon] || Search;
                      
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm outline-none transition-colors ${
                            isSelected ? "bg-primary/5 text-primary" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${isSelected ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-background text-muted-foreground'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{result.title}</span>
                            <span className="text-xs text-muted-foreground truncate">{result.subtitle}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
