import { useState, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SQL_QUESTIONS } from '../data/questions';
import './dashboard.scss';

// ─── Icons ───────────────────────────────────────────────────────
const IconDB = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);
const IconPlay = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
const IconReset = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);
const IconSearch = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
);
const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IconCode = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
);
const IconLogout = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IconChevron = ({ up }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'rotate(180deg)' : 'none' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// ─── Monaco Editor config ─────────────────────────────────────────
const EDITOR_OPTIONS = {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
    fontLigatures: true,
    lineHeight: 22,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    renderLineHighlight: 'line',
    padding: { top: 16, bottom: 16 },
    folding: true,
    wordWrap: 'on',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true },
    guides: { indentation: true },
    suggest: { showKeywords: true },
};

const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

// ─── QuestionCard Component ───────────────────────────────────────
function QuestionCard({ q, isActive, onClick }) {
    return (
        <button
            className={`question-card${isActive ? ' question-card--active' : ''}`}
            onClick={onClick}
            aria-pressed={isActive}
        >
            <div className="question-card__header">
                <span className="question-card__number">#{String(q.id).padStart(2, '0')}</span>
                <span className={`question-card__badge question-card__badge--${q.difficulty}`}>
                    {q.difficulty}
                </span>
            </div>
            <div className="question-card__title">{q.title}</div>
            <div className="question-card__meta">
                <span className="question-card__category">{q.category}</span>
            </div>
        </button>
    );
}

// ─── Editor Empty State ───────────────────────────────────────────
function EditorEmpty({ onSelectFirst }) {
    return (
        <div className="editor-panel__empty">
            <div className="editor-panel__empty-icon">
                <IconCode />
            </div>
            <div className="editor-panel__empty-title">Select a question</div>
            <p className="editor-panel__empty-sub">
                Pick a challenge from the list to open it in the editor
            </p>
            <button className="editor-panel__empty-hint" onClick={onSelectFirst}>
                <span>← Start with #01</span>
            </button>
        </div>
    );
}

// ─── Run Result Bar ───────────────────────────────────────────────
function RunResult({ result, onDismiss }) {
    if (!result) return null;
    return (
        <div className={`run-result run-result--${result.ok ? 'success' : 'error'}`}>
            <span className="run-result__icon">
                {result.ok ? <IconCheck /> : <IconX />}
            </span>
            <span className="run-result__msg">{result.message}</span>
            <span className="run-result__time">{result.time}ms</span>
        </div>
    );
}

// ─── Dashboard Page ───────────────────────────────────────────────
export default function Dashboard() {
    const { userdata, logout } = useAuth();
    const navigate = useNavigate();

    const [selectedId, setSelectedId] = useState(null);
    const [codes, setCodes] = useState({});
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [runResult, setRunResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [listExpanded, setListExpanded] = useState(false);

    const selectedQ = useMemo(() =>
        SQL_QUESTIONS.find(q => q.id === selectedId) || null,
        [selectedId]);

    const filteredQuestions = useMemo(() => {
        return SQL_QUESTIONS.filter(q => {
            const matchFilter = filter === 'All' || q.difficulty === filter.toLowerCase();
            const matchSearch = !search ||
                q.title.toLowerCase().includes(search.toLowerCase()) ||
                q.category.toLowerCase().includes(search.toLowerCase());
            return matchFilter && matchSearch;
        });
    }, [filter, search]);

    const handleSelect = useCallback((q) => {
        setSelectedId(q.id);
        setRunResult(null);
        setListExpanded(false);
        if (!codes[q.id]) {
            setCodes(prev => ({ ...prev, [q.id]: q.starterCode }));
        }
    }, [codes]);

    const handleEditorChange = useCallback((value) => {
        if (!selectedId) return;
        setCodes(prev => ({ ...prev, [selectedId]: value || '' }));
    }, [selectedId]);

    const handleReset = useCallback(() => {
        if (!selectedQ) return;
        setCodes(prev => ({ ...prev, [selectedQ.id]: selectedQ.starterCode }));
        setRunResult(null);
    }, [selectedQ]);

    const handleRun = useCallback(async () => {
        if (!selectedQ || running) return;
        setRunning(true);
        setRunResult(null);
        const delay = 400 + Math.random() * 600;
        await new Promise(r => setTimeout(r, delay));
        const ok = Math.random() > 0.3;
        setRunResult({
            ok,
            message: ok
                ? 'Query executed successfully — results match expected output'
                : 'Syntax error near line 3 — check your JOIN condition',
            time: Math.round(delay),
        });
        setRunning(false);
    }, [selectedQ, running]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentCode = selectedId ? (codes[selectedId] ?? selectedQ?.starterCode ?? '') : '';
    const initials = userdata?.email?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

    return (
        <div className="dashboard">
            {/* ── Navbar ── */}
            <nav className="navbar">
                <div className="navbar__logo">
                    <div className="navbar__logo-icon"><IconDB /></div>
                    <div className="navbar__logo-text">SQL<span>Lab</span></div>
                </div>

                <div className="navbar__center">
                    <div className="navbar__dot" />
                    <span>Interactive SQL Editor</span>
                </div>

                <div className="navbar__right">
                    <div className="navbar__user">
                        <div className="navbar__avatar">{initials}</div>
                        <span className="navbar__username">{userdata?.email}</span>
                    </div>
                    <button className="navbar__logout" onClick={handleLogout} aria-label="Log out">
                        <IconLogout />
                        <span className="sr-only">Log out</span>
                        <span aria-hidden="true">Sign out</span>
                    </button>
                </div>
            </nav>

            {/* ── Main Workspace ── */}
            <main className="workspace">
                {/* ── Question List Sidebar ── */}
                <aside className={`question-list${listExpanded ? ' question-list--expanded' : ''}`}>
                    <div className="question-list__header">
                        <span className="question-list__title">Questions</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="question-list__count">{filteredQuestions.length}</span>
                            {/* Mobile toggle */}
                            <button
                                className="btn btn--ghost btn--sm"
                                style={{ display: 'flex' }}
                                onClick={() => setListExpanded(v => !v)}
                                aria-label="Toggle question list"
                                aria-expanded={listExpanded}
                            >
                                <IconChevron up={listExpanded} />
                            </button>
                        </div>
                    </div>

                    {/* Search — desktop only via CSS */}
                    <div className="question-list__search">
                        <div className="question-list__search-wrap">
                            <IconSearch />
                            <input
                                type="search"
                                placeholder="Search questions…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                aria-label="Search questions"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="question-list__filter" role="group" aria-label="Filter by difficulty">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                className={`question-list__filter-btn${filter === f ? ' question-list__filter-btn--active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    <div className="question-list__scroll">
                        {filteredQuestions.length === 0 ? (
                            <div className="question-list__empty">
                                <span>No questions found</span>
                            </div>
                        ) : (
                            filteredQuestions.map(q => (
                                <QuestionCard
                                    key={q.id}
                                    q={q}
                                    isActive={q.id === selectedId}
                                    onClick={() => handleSelect(q)}
                                />
                            ))
                        )}
                    </div>
                </aside>

                {/* ── Editor Panel ── */}
                <section className="editor-panel">
                    {!selectedQ ? (
                        <EditorEmpty onSelectFirst={() => handleSelect(SQL_QUESTIONS[0])} />
                    ) : (
                        <div className="question-detail">
                            {/* Top bar */}
                            <div className="question-detail__topbar">
                                <div className="question-detail__meta">
                                    <h1 className="question-detail__title">{selectedQ.title}</h1>
                                    <span className={`question-card__badge question-card__badge--${selectedQ.difficulty}`}>
                                        {selectedQ.difficulty}
                                    </span>
                                    <span className="question-card__category">{selectedQ.category}</span>
                                </div>
                                <div className="question-detail__actions">
                                    <button className="btn btn--ghost btn--sm" onClick={handleReset} title="Reset to starter code">
                                        <IconReset />
                                        <span>Reset</span>
                                    </button>
                                    <button
                                        className="btn btn--primary btn--sm"
                                        onClick={handleRun}
                                        disabled={running}
                                        aria-busy={running}
                                    >
                                        <IconPlay />
                                        <span>{running ? 'Running…' : 'Run'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="question-detail__body">
                                {/* Description Pane */}
                                <div className="question-detail__description">
                                    <div className="question-detail__desc-section">
                                        <div className="question-detail__desc-label">Description</div>
                                        <p className="question-detail__desc-text">{selectedQ.description}</p>
                                    </div>

                                    <div className="question-detail__desc-section">
                                        <div className="question-detail__desc-label">Schema</div>
                                        <pre className="question-detail__schema-block">{selectedQ.schema}</pre>
                                    </div>

                                    <div className="question-detail__desc-section">
                                        <div className="question-detail__desc-label">Tags</div>
                                        <div className="question-detail__tags">
                                            {selectedQ.tags.map(t => (
                                                <span key={t} className="question-detail__tag">{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="question-detail__desc-section">
                                        <div className="question-detail__desc-label">Expected Output</div>
                                        <pre className="question-detail__expected">{selectedQ.expectedOutput}</pre>
                                    </div>
                                </div>

                                {/* Editor Pane */}
                                <div className="question-detail__editor">
                                    <div className="question-detail__editor-header">
                                        <div className="question-detail__editor-file">
                                            <div className="question-detail__editor-file-dot" />
                                            <span>solution.sql</span>
                                        </div>
                                        <div className="question-detail__editor-btns">
                                            <span style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: '11px',
                                                color: '#444c56',
                                            }}>SQL</span>
                                        </div>
                                    </div>

                                    <div className="question-detail__monaco">
                                        <Editor
                                            key={selectedQ.id}
                                            language="sql"
                                            theme="vs-dark"
                                            value={currentCode}
                                            onChange={handleEditorChange}
                                            options={EDITOR_OPTIONS}
                                            beforeMount={(monaco) => {
                                                // Custom dark theme
                                                monaco.editor.defineTheme('sqllab-dark', {
                                                    base: 'vs-dark',
                                                    inherit: true,
                                                    rules: [
                                                        { token: 'keyword', foreground: '00d9ff', fontStyle: 'bold' },
                                                        { token: 'keyword.sql', foreground: '00d9ff', fontStyle: 'bold' },
                                                        { token: 'string.sql', foreground: '22c55e' },
                                                        { token: 'string', foreground: '22c55e' },
                                                        { token: 'number', foreground: 'f59e0b' },
                                                        { token: 'comment', foreground: '444c56', fontStyle: 'italic' },
                                                        { token: 'comment.sql', foreground: '444c56', fontStyle: 'italic' },
                                                        { token: 'identifier', foreground: 'cdd9e5' },
                                                        { token: 'operator', foreground: '768390' },
                                                    ],
                                                    colors: {
                                                        'editor.background': '#080c10',
                                                        'editor.foreground': '#cdd9e5',
                                                        'editor.lineHighlightBackground': '#0e1318',
                                                        'editor.selectionBackground': '#00d9ff26',
                                                        'editor.inactiveSelectionBackground': '#00d9ff14',
                                                        'editorLineNumber.foreground': '#444c56',
                                                        'editorLineNumber.activeForeground': '#768390',
                                                        'editorCursor.foreground': '#00d9ff',
                                                        'editorWidget.background': '#0e1318',
                                                        'editorWidget.border': '#1e2d3d',
                                                        'editorSuggestWidget.background': '#0e1318',
                                                        'editorSuggestWidget.border': '#1e2d3d',
                                                        'editorSuggestWidget.selectedBackground': '#00d9ff14',
                                                        'scrollbarSlider.background': '#1e2d3d80',
                                                        'scrollbarSlider.hoverBackground': '#253545',
                                                        'scrollbarSlider.activeBackground': '#253545',
                                                    },
                                                });
                                                monaco.editor.setTheme('sqllab-dark');
                                            }}
                                            onMount={(editor, monaco) => {
                                                monaco.editor.setTheme('sqllab-dark');
                                                // Ctrl/Cmd+Enter to run
                                                editor.addAction({
                                                    id: 'run-query',
                                                    label: 'Run Query',
                                                    keybindings: [
                                                        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
                                                    ],
                                                    run: () => handleRun(),
                                                });
                                            }}
                                        />
                                    </div>

                                    <RunResult result={runResult} />
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
