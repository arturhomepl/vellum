import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface CommandOption {
  label: string;
  icon: string;
  action: (editor: any) => void;
}

interface VellumEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onUpdate: (data: { title: string; content: string }) => void;
}

export const VellumEditor: React.FC<VellumEditorProps> = ({ 
  initialTitle = '', 
  initialContent = '', 
  onUpdate 
}) => {
  const titleRef = useRef(initialTitle);
  const [title, setTitle] = useState(initialTitle);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    titleRef.current = initialTitle;
  }, [initialTitle]);

  const commands: CommandOption[] = [
    { label: 'Bold', icon: 'B', action: (editor: any) => editor.chain().focus().toggleBold().run() },
    { label: 'Italic', icon: 'I', action: (editor: any) => editor.chain().focus().toggleItalic().run() },
    { label: 'Heading 1', icon: 'H1', action: (editor: any) => editor.chain().focus().setHeading({ level: 1 }).run() },
    { label: 'Heading 2', icon: 'H2', action: (editor: any) => editor.chain().focus().setHeading({ level: 2 }).run() },
    { label: 'Bullet List', icon: '•', action: (editor: any) => editor.chain().focus().toggleBulletList().run() },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Zapisz swoje myśli... / - menu podręczne',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate({ 
        title: title || titleRef.current, 
        content: editor.getHTML() 
      });
    },
  }, []);

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  const safeHandleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    titleRef.current = val;
    if (editor) {
      onUpdate({ title: val, content: editor.getHTML() });
    }
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editor) return;
    const { key } = event;

    if (key === '/') {
      setTimeout(() => {
        setMenuPosition({ top: 40, left: 40 }); 
        setMenuVisible(true);
        setSelectedIndex(0);
      }, 0);
      return;
    }

    if (menuVisible) {
      if (key === 'ArrowDown') {
        event.preventDefault();
        setiosamenteAtIndex((prev) => (prev + 1) % commands.length);
        return;
      }
      if (key === 'ArrowUp') {
        event.preventDefault();
        setiosamenteAtIndex((prev) => (prev - 1 + commands.length) % commands.length);
        return;
      }
      if (key === 'Enter') {
        event.preventDefault();
        commands[selectedIndex].action(editor);
        setMenuVisible(false);
        return;
      }
      if (key === 'Escape') {
        event.preventDefault();
        setMenuVisible(false);
        return;
      }
    }
  }, [editor, menuVisible, selectedIndex, commands]);

  // Replaced with correct setSelectedIndex helper logic
  const setiosamenteAtIndex = (fn: (prev: number) => number) => {
     setSelectedIndex(fn);
  };

  useEffect(() => {
    const clickHandler = () => setMenuVisible(false);
    window.addEventListener('click', clickHandler);
    return () => window.removeEventListener('click', clickHandler);
  }, []);

  if (!editor) return null;

  // Logic for Ghost Text behavior
  const isDefaultText = title === 'Nowy Dokument';
  const titleTextColor = (isFocused || !isDefaultText) ? 'text-slate-900' : 'text-slate-200';
  const titleFontWeight = (isFocused || !isDefaultText) ? 'font-bold' : 'font-normal';

  return (
    <div className="flex flex-col w-full gap-6" onKeyDown={handleKeyDown}>
      <div className="border-b border-slate-100 pb-4">
        <input
          type="text"
          value={title}
          onChange={safeHandleTitleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full text-4xl ${titleTextColor} ${titleFontWeight} bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 transition-colors duration-200`}
          placeholder="Tytuł artykułu..."
        />
      </div>

      <div className="prose prose-slate max-w-none outline-none border-bottom border-none ring-0 focus:outline-none focus:ring-0 focus:border-none [&_.tiptap-placeholder]:text-slate-400 [&_.tiptap-placeholder]:opacity-100">
        <EditorContent editor={editor} />
      </div>

      {menuVisible && (
        <div 
          role="menu"
          className="absolute z-50 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 w-56 overflow-hidden"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {commands.map((cmd, index) => (
            <button
              key={cmd.label}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={(e) => {
                e.preventDefault();
                cmd.action(editor);
                setMenuVisible(false);
              }}
              className={`w-full flex items-center gap-3 text-left px-4 py-2 text-sm transition-colors ${
                index === selectedIndex ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded text-[10px] font-bold">{cmd.icon}</span>
              {cmd.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VellumEditor;
