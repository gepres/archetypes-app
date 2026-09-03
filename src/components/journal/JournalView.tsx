import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Search,
  BookOpen,
  HelpCircle,
  Check,
  Smile,
} from 'lucide-react';
import { ARCHETYPES, ARCHETYPES_LIST } from '../../data/archetypesData';
import { JOURNAL_PROMPTS } from '../../services/storageService';
import { ArchetypeId, JournalEntry, GenderMode } from '../../types';
import { ArchetypeBadge } from '../common/ArchetypeBadge';

interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onDeleteEntry: (id: string) => void;
  /** Perspectiva activa: las insignias de arquetipo tambien la siguen. */
  gender?: GenderMode;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  gender = 'male',
  onAddEntry,
  onDeleteEntry,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchetypeFilter, setSelectedArchetypeFilter] = useState<string>('todos');

  // New entry form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedArchetypes, setSelectedArchetypes] = useState<ArchetypeId[]>([]);
  const [mood, setMood] = useState('Reflexivo');
  const [promptUsed, setPromptUsed] = useState('');

  const moodOptions = [
    'Reflexivo',
    'Sereno',
    'Desafiado',
    'Inspirado',
    'En confrontación',
    'Agradecido',
    'Cansado pero consciente',
  ];

  const handleSelectPrompt = (prompt: string) => {
    setPromptUsed(prompt);
    if (!title) {
      setTitle(prompt.slice(0, 45) + (prompt.length > 45 ? '...' : ''));
    }
  };

  const handleToggleArchetypeTag = (id: ArchetypeId) => {
    setSelectedArchetypes(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddEntry({
      title: title.trim(),
      content: content.trim(),
      relatedArchetypes: selectedArchetypes,
      mood,
      promptUsed: promptUsed || undefined,
    });

    // Reset form
    setTitle('');
    setContent('');
    setSelectedArchetypes([]);
    setPromptUsed('');
    setMood('Reflexivo');
    setIsCreating(false);
  };

  const filteredEntries = entries.filter(e => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      e.title.toLowerCase().includes(query) ||
      e.content.toLowerCase().includes(query) ||
      (e.mood && e.mood.toLowerCase().includes(query));

    const matchesArchetype =
      selectedArchetypeFilter === 'todos' ||
      e.relatedArchetypes.includes(selectedArchetypeFilter as ArchetypeId);

    return matchesSearch && matchesArchetype;
  });

  return (
    <div id="journal-view" className="max-w-4xl mx-auto space-y-8 pb-24 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1E2A25] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D6A84F] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bitácora de Autoconocimiento</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2EFE6] mt-1">
            Diario Arquetípico
          </h1>
          <p className="text-xs sm:text-sm text-[#9DA79F] mt-0.5">
            Documenta tus decisiones, observa qué arquetipos encarnas y reflexiona sobre tus sombras.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#315C45] hover:bg-[#3D7055] text-xs font-semibold text-[#F2EFE6] transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cerrar formulario' : 'Nueva Reflexión'}</span>
        </button>
      </div>

      {/* New Entry Creation Form */}
      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-2xl bg-[#121A17] border border-[#315C45] space-y-6 shadow-xl animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#1E2A25] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#F2EFE6]">
              Escribir Nueva Entrada
            </h3>
            <span className="text-xs text-[#9DA79F]">Privado en tu navegador</span>
          </div>

          {/* Guided Prompt Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-[#D6A84F] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Elegir Pregunta Guía (Opcional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {JOURNAL_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`text-xs p-2 rounded-lg border text-left transition-all ${
                    promptUsed === prompt
                      ? 'bg-[#315C45] border-[#D6A84F] text-[#F2EFE6]'
                      : 'bg-[#16201D] border-[#1E2A25] text-[#9DA79F] hover:text-[#F2EFE6] hover:bg-[#1A2521]'
                  }`}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Título de la reflexión
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Límites en el trabajo, Momento de silencio con el Sabio..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#16201D] border border-[#1E2A25] text-sm text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#315C45]"
            />
          </div>

          {/* Content Body */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] block">
              Reflexión
            </label>
            <textarea
              required
              rows={6}
              placeholder="Escribe libremente sobre lo que estás sintiendo, decidiendo o confrontando hoy..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#16201D] border border-[#1E2A25] text-sm text-[#F2EFE6] placeholder-[#6B7A72] leading-relaxed focus:outline-none focus:border-[#315C45]"
            />
          </div>

          {/* Tag Related Archetypes */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Arquetipos involucrados en esta experiencia</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ARCHETYPES_LIST.map(a => {
                const isSelected = selectedArchetypes.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleToggleArchetypeTag(a.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                      isSelected
                        ? 'bg-[#315C45] text-[#F2EFE6] border border-[#D6A84F] font-semibold'
                        : 'bg-[#16201D] text-[#9DA79F] border border-[#1E2A25] hover:text-[#F2EFE6]'
                    }`}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood / Estado anímico */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-[#9DA79F] flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" />
              <span>Estado anímico predominante</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {moodOptions.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                    mood === m
                      ? 'bg-[#1E2A25] border-[#D6A84F] text-[#D6A84F] font-semibold'
                      : 'bg-[#16201D] border-[#1E2A25] text-[#9DA79F] hover:text-[#F2EFE6]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2A25]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#9DA79F] hover:text-[#F2EFE6]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#D6A84F] hover:bg-[#E5BE72] text-[#0B1110] text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Guardar Entrada
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-y border-[#1E2A25] py-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#9DA79F]">Filtrar por:</span>
          <select
            value={selectedArchetypeFilter}
            onChange={e => setSelectedArchetypeFilter(e.target.value)}
            className="p-1.5 rounded-lg bg-[#121A17] border border-[#1E2A25] text-xs text-[#F2EFE6] focus:outline-none"
          >
            <option value="todos">Todos los arquetipos</option>
            {ARCHETYPES_LIST.map(a => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[#6B7A72] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en el diario..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#121A17] border border-[#1E2A25] rounded-lg text-xs text-[#F2EFE6] placeholder-[#6B7A72] focus:outline-none focus:border-[#315C45]"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#121A17] border border-[#1E2A25] space-y-3">
            <BookOpen className="w-8 h-8 text-[#6B7A72] mx-auto" />
            <p className="text-sm font-medium text-[#F2EFE6]">
              No se encontraron entradas en el diario.
            </p>
            <p className="text-xs text-[#9DA79F]">
              Comienza escribiendo una reflexión sobre tus desafíos actuales.
            </p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="p-6 rounded-2xl bg-[#121A17] border border-[#1E2A25] hover:border-[#23332D] space-y-4 shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#9DA79F]">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-[#D6A84F]" />
                      {new Date(entry.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {entry.mood && (
                      <>
                        <span className="text-[#6B7A72]">·</span>
                        <span className="px-2 py-0.5 rounded bg-[#16201D] text-[#D6A84F] text-[10px]">
                          {entry.mood}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#F2EFE6]">
                    {entry.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm("¿Eliminar esta reflexión?")) {
                      onDeleteEntry(entry.id);
                    }
                  }}
                  className="p-1.5 text-[#6B7A72] hover:text-[#EF4444] rounded-lg hover:bg-[#1A2521] transition-colors"
                  title="Eliminar entrada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {entry.promptUsed && (
                <div className="p-3 rounded-lg bg-[#16201D] border border-[#1E2A25] text-xs text-[#9DA79F] italic font-serif">
                  "{entry.promptUsed}"
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#C5CFC7] leading-relaxed whitespace-pre-line font-light">
                {entry.content}
              </p>

              {entry.relatedArchetypes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1E2A25]">
                  <span className="text-[10px] uppercase tracking-wider text-[#6B7A72] font-semibold mr-1">
                    Arquetipos:
                  </span>
                  {entry.relatedArchetypes.map(id => (
                    <ArchetypeBadge key={id} id={id} size="sm" gender={gender} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
