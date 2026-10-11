
import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, BookOpen, Check, ChevronDown, Code2,
  FileCode2, Folder, LayoutDashboard, Menu, Plus, Search, Settings2,
  Sparkles, Terminal, Trash2, X, Pencil, Clock3, Eye, EyeOff
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const initialNotes = [
  {
    id: 1,
    title: "Understanding React Hooks",
    category: "React",
    description: "A quick reference for managing component state and side effects.",
    markdown: `# React Hooks

Hooks let functional components use React features.

## useState

Use it to manage component state.

\`\`\`jsx
const [count, setCount] = useState(0);

function increment() {
  setCount((previous) => previous + 1);
}
\`\`\`

## useEffect
- Synchronize with external systems.
- Clean up subscriptions when needed.

- [x] Learn useState
- [ ] Practice useEffect`,
    code: "const [count, setCount] = useState(0);",
    codeLanguage: "jsx",
    date: "Today",
    color: "purple",
  },
  {
    id: 2,
    title: "Python List Comprehensions",
    category: "Python",
    description: "Create readable lists in a concise and Pythonic way.",
    markdown: `# List Comprehensions

Create a new list from an iterable.

\`\`\`python
squares = [n * n for n in range(1, 6)]
print(squares)
\`\`\`

Output: \`[1, 4, 9, 16, 25]\`

| Part | Meaning |
| --- | --- |
| \`n * n\` | Expression |
| \`for n in range(1, 6)\` | Iteration |`,
    code: "squares = [n * n for n in range(1, 6)]",
    codeLanguage: "python",
    date: "Yesterday",
    color: "blue",
  },
  {
    id: 3,
    title: "Useful Git Commands",
    category: "Tools",
    description: "Everyday commands for managing a project and its history.",
    markdown: `# Git Quick Reference

\`\`\`bash
git status
git add .
git commit -m "Add feature"
git push
\`\`\`

Remember to check \`git status\` before committing.`,
    code: 'git add . && git commit -m "Add feature"',
    codeLanguage: "bash",
    date: "Oct 7",
    color: "orange",
  },
  {
    id: 4,
    title: "REST API Fundamentals",
    category: "Backend",
    description: "Keep endpoints predictable and use HTTP methods consistently.",
    markdown: `# REST API Fundamentals

| Method | Purpose |
| --- | --- |
| GET | Retrieve data |
| POST | Create data |
| PUT | Replace data |
| PATCH | Update data |
| DELETE | Remove data |

Example endpoint:

\`GET /api/projects\``,
    code: "GET /api/projects",
    codeLanguage: "http",
    date: "Oct 6",
    color: "green",
  },
];

const categories = ["All notes", "React", "Python", "Backend", "Tools"];

const languages = [
  ["javascript", "JavaScript"],
  ["jsx", "React / JSX"],
  ["python", "Python"],
  ["typescript", "TypeScript"],
  ["tsx", "TSX"],
  ["sql", "SQL"],
  ["bash", "Bash / Terminal"],
  ["json", "JSON"],
  ["css", "CSS"],
  ["html", "HTML"],
  ["java", "Java"],
  ["c", "C"],
  ["cpp", "C++"],
  ["http", "HTTP"],
  ["markdown", "Markdown"],
];

const blankNote = {
  title: "",
  category: "React",
  description: "",
  markdown: "",
  code: "",
  codeLanguage: "javascript",
};

function readNotes() {
  try {
    const saved = localStorage.getItem("devlog-notes");
    if (!saved) return initialNotes;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return initialNotes;

    // Add defaults so older saved notes remain compatible.
    return parsed.map((note) => ({
      ...note,
      markdown: note.markdown || "",
      code: note.code || "",
      codeLanguage: note.codeLanguage || "javascript",
      description: note.description || "",
    }));
  } catch {
    return initialNotes;
  }
}

function IconButton({ label, onClick, children, danger = false }) {
  return (
    <button
      className={`icon-button ${danger ? "danger" : ""}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MarkdownContent({ content = "" }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-([\w-]+)/.exec(className || "");
            const source = String(children).replace(/\n$/, "");

            if (match) {
              const language = match[1];

              return (
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  PreTag="div"
                  customStyle={{
                    margin: "12px 0",
                    padding: "16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    background: "#111318",
                    maxWidth: "100%",
                  }}
                  wrapLongLines
                >
                  {source}
                </SyntaxHighlighter>
              );
            }

            // Markdown inline code has no language class.
            return (
              <code className="markdown-inline-code" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div className="markdown-pre">{children}</div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState(readNotes);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All notes");
  const [activeNav, setActiveNav] = useState("Overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState(blankNote);
  const [notice, setNotice] = useState("");
  const [showEditorPreview, setShowEditorPreview] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("devlog-notes", JSON.stringify(notes));
    } catch {
      setNotice("Could not save notes. Browser storage may be full.");
    }
  }, [notes]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!modalOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") setModalOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [modalOpen]);

  const filteredNotes = useMemo(() => {
    const search = query.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesCategory =
        activeCategory === "All notes" ||
        note.category === activeCategory;

      const searchableText = [
        note.title,
        note.description,
        note.markdown,
        note.code,
        note.codeLanguage,
        note.category,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory &&
        (!search || searchableText.includes(search));
    });
  }, [notes, query, activeCategory]);

  const categoryCount = (category) =>
    category === "All notes"
      ? notes.length
      : notes.filter((note) => note.category === category).length;

  function openNewNote() {
    setEditingId(null);
    setForm({ ...blankNote });
    setShowEditorPreview(false);
    setModalOpen(true);
  }

  function openEditNote(note) {
    setEditingId(note.id);
    setForm({
      title: note.title || "",
      category: note.category || "React",
      description: note.description || "",
      markdown: note.markdown || "",
      code: note.code || "",
      codeLanguage: note.codeLanguage || "javascript",
    });
    setShowEditorPreview(false);
    setModalOpen(true);
  }

  function saveNote(event) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    if (editingId !== null) {
      setNotes((current) =>
        current.map((note) =>
          note.id === editingId
            ? { ...note, ...form, title }
            : note
        )
      );
      setNotice("Note updated successfully.");
    } else {
      setNotes((current) => [
        {
          id: Date.now(),
          ...form,
          title,
          date: "Just now",
          color: "purple",
        },
        ...current,
      ]);
      setNotice("New note created.");
    }

    setModalOpen(false);
  }

  function deleteNote(id) {
    if (!window.confirm("Delete this note permanently?")) return;

    setNotes((current) => current.filter((note) => note.id !== id));
    setNotice("Note deleted.");
  }

  const stats = [
    {
      label: "Total notes",
      value: notes.length,
      icon: BookOpen,
      tone: "purple",
    },
    {
      label: "Code snippets",
      value: notes.filter((note) => note.code.trim()).length,
      icon: Code2,
      tone: "blue",
    },
    {
      label: "Topics explored",
      value: new Set(notes.map((note) => note.category)).size,
      icon: Activity,
      tone: "green",
    },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <a
          className="brand"
          href="#home"
          onClick={() => setActiveNav("Overview")}
        >
          <span className="brand-mark">
            <Code2 size={22} />
          </span>
          <span>
            Dev<span className="brand-accent">Log</span>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={`nav-item ${activeNav === "Overview" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("Overview");
              setActiveCategory("All notes");
              setMobileMenu(false);
            }}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className={`nav-item ${activeNav === "My notes" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("My notes");
              setActiveCategory("All notes");
              setMobileMenu(false);
            }}
          >
            <FileCode2 size={18} />
            My notes
            <span className="nav-count">{notes.length}</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-heading">
          <span>COLLECTIONS</span>
          <IconButton label="Add note" onClick={openNewNote}>
            <Plus size={16} />
          </IconButton>
        </div>

        <nav className="category-nav" aria-label="Note categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-item ${
                activeCategory === category ? "category-active" : ""
              }`}
              onClick={() => {
                setActiveCategory(category);
                setActiveNav(category === "All notes" ? "My notes" : "Overview");
                setMobileMenu(false);
              }}
            >
              {category === "All notes" ? (
                <Folder size={17} />
              ) : (
                <span
                  className={`category-dot dot-${category.toLowerCase()}`}
                />
              )}
              <span>{category}</span>
              <span className="category-count">
                {categoryCount(category)}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">M</div>
            <div className="profile-copy">
              <strong>My workspace</strong>
              <span>Personal journal</span>
            </div>
            <Settings2 size={17} className="profile-settings" />
          </div>

          <div className="sidebar-footnote">
            <span className="online-dot" />
            All notes saved locally
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-content" id="home">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            aria-label="Open menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>
              {activeCategory === "All notes" ? activeNav : activeCategory}
            </strong>
          </div>

          <div className="topbar-right">
            <span className="today-label">
              <span className="online-dot" />
              Personal workspace
            </span>
            <div className="top-avatar">M</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <Sparkles size={14} />
                YOUR DEVELOPER SPACE
              </div>
              <h1>
                Make learning <span>stick.</span>
              </h1>
              <p className="welcome-subtitle">
                Your ideas, code snippets, and discoveries — all in one place.
              </p>
            </div>

            <button className="primary-button" onClick={openNewNote}>
              <Plus size={18} />
              Create a note
            </button>
          </section>

          <section className="stats-grid" aria-label="Your journal statistics">
            {stats.map(({ label, value, icon: StatIcon, tone }) => (
              <article className="stat-card" key={label}>
                <div className={`stat-icon ${tone}`}>
                  <StatIcon size={20} />
                </div>
                <div className="stat-copy">
                  <span>{label}</span>
                  <strong>{String(value).padStart(2, "0")}</strong>
                </div>
                <ArrowUpRight size={17} className="stat-arrow" />
              </article>
            ))}
          </section>

          <section className="notes-section">
            <div className="section-heading">
              <div>
                <h2>
                  {activeCategory === "All notes"
                    ? "Your knowledge base"
                    : activeCategory}
                </h2>
                <p>Small notes today. Strong skills tomorrow.</p>
              </div>

              <div className="note-count-label">
                {filteredNotes.length}{" "}
                {filteredNotes.length === 1 ? "note" : "notes"}
              </div>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search notes, topics, snippets..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search notes"
                />
                {query && (
                  <IconButton
                    label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </IconButton>
                )}
              </div>

              <label className="filter-select">
                <span className="sr-only">Filter by category</span>
                <select
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </label>
            </div>

            {filteredNotes.length > 0 ? (
              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <div className="note-card-top">
                      <span
                        className={`note-category tag-${(
                          note.category || "React"
                        ).toLowerCase()}`}
                      >
                        {note.category}
                      </span>

                      <div className="note-actions">
                        <IconButton
                          label="Edit note"
                          onClick={() => openEditNote(note)}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton
                          label="Delete note"
                          danger
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </div>

                    <h3>{note.title}</h3>
                    <p className="note-description">
                      {note.description || "No description added yet."}
                    </p>

                    {note.markdown && (
                      <details className="markdown-details">
                        <summary>
                          <BookOpen size={15} />
                          <span>Read full notes</span>
                          <ChevronDown size={15} className="details-chevron" />
                        </summary>
                        <MarkdownContent content={note.markdown} />
                      </details>
                    )}

                    {note.code && (
                      <div className="snippet">
                        <div className="snippet-top">
                          <span>
                            <Terminal size={13} />
                            {(note.codeLanguage || "javascript").toUpperCase()}
                          </span>
                          <span className="snippet-dots">•••</span>
                        </div>

                        <SyntaxHighlighter
                          language={note.codeLanguage || "javascript"}
                          style={oneDark}
                          customStyle={{
                            margin: 0,
                            padding: "14px",
                            borderRadius: "0 0 10px 10px",
                            fontSize: "12px",
                            background: "#111318",
                            maxWidth: "100%",
                          }}
                          wrapLongLines
                        >
                          {note.code}
                        </SyntaxHighlighter>
                      </div>
                    )}

                    <div className="note-footer">
                      <span>
                        <Clock3 size={14} />
                        {note.date || "Saved"}
                      </span>
                      <span className="read-label">
                        Personal note <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={25} />
                </div>
                <h3>No notes found</h3>
                <p>
                  Try a different search or create a note to get started.
                </p>
                <button className="primary-button" onClick={openNewNote}>
                  <Plus size={17} />
                  Create a note
                </button>
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>
              <span className="footer-heart">✳</span> Built for curious minds.
            </span>
            <span>
              DEVLOG <span className="footer-separator">·</span> PERSONAL
              CODING JOURNAL
            </span>
          </footer>
        </div>
      </main>

      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <form className="note-modal" onSubmit={saveNote}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  <FileCode2 size={14} />
                  KNOWLEDGE BASE
                </span>
                <h2>
                  {editingId !== null ? "Edit your note" : "Create a new note"}
                </h2>
              </div>
              <IconButton
                label="Close dialog"
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </IconButton>
            </div>

            <label className="field-label">
              Note title <span>*</span>
              <input
                autoFocus
                required
                maxLength={100}
                placeholder="e.g. Python decorators explained"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </label>

            <label className="field-label">
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                {categories
                  .filter((category) => category !== "All notes")
                  .map((category) => (
                    <option key={category}>{category}</option>
                  ))}
              </select>
            </label>

            <label className="field-label">
              Description
              <textarea
                rows={3}
                placeholder="What did you learn? Add a short explanation..."
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>

            <div className="field-label markdown-editor-field">
              <div className="editor-label-row">
                <label htmlFor="markdown-notes">
                  Learning notes <span className="optional">Markdown</span>
                </label>
                <button
                  type="button"
                  className="secondary-button preview-button"
                  onClick={() => setShowEditorPreview((current) => !current)}
                >
                  {showEditorPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                  {showEditorPreview ? "Edit" : "Preview"}
                </button>
              </div>

              {showEditorPreview ? (
                <div className="editor-preview-panel">
                  {form.markdown.trim() ? (
                    <MarkdownContent content={form.markdown} />
                  ) : (
                    <p className="editor-hint">
                      Your Markdown preview will appear here.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="editor-hint">
                    Supports headings, lists, tables, checklists and fenced code
                    blocks.
                  </p>
                  <textarea
                    id="markdown-notes"
                    className="markdown-input"
                    rows={9}
                    spellCheck="false"
                    placeholder={`# What I learned

## Key concepts
- First concept
- Second concept

## Code example
\`\`\`python
class Student:
    def __init__(self, name):
        self.name = name
\`\`\`

| Concept | Purpose |
| --- | --- |
| Class | Blueprint |
| Object | Instance |

- [x] Read the topic
- [ ] Practice the code`}
                    value={form.markdown}
                    onChange={(event) =>
                      setForm({ ...form, markdown: event.target.value })
                    }
                  />
                </>
              )}
            </div>

            <label className="field-label">
              Code language
              <select
                value={form.codeLanguage}
                onChange={(event) =>
                  setForm({ ...form, codeLanguage: event.target.value })
                }
              >
                {languages.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Code snippet <span className="optional">(optional)</span>
              <textarea
                className="code-input"
                rows={4}
                spellCheck="false"
                placeholder="// Paste your code snippet here..."
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                <Check size={17} />
                {editingId !== null ? "Save changes" : "Create note"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
