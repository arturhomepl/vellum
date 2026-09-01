1|import React, { useCallback, useEffect, useState, useRef } from 'react';
2|import { useEditor, EditorContent } from '@tiptap/react';
3|import StarterKit from '@tiptap/starter-kit';
4|import Placeholder from '@tiptap/extension-placeholder';
5|
6|interface CommandOption {
7|  label: string;
8|  icon: string;
9|  action: (editor: any) => void;
10|}
11|
12|interface VellumEditorProps {
13|  initialTitle?: string;
14|  initialContent?: string;
15|  onUpdate: (data: { title: string; content: string }) => void;
16|}
17|
18|export const VellumEditor: React.FC<VellumEditorProps> = ({ 
19|  initialTitle = '', 
20|  initialContent = '', 
21|  onUpdate 
22|}) => {
23|  const titleRef = useRef(initialTitle);
24|  const [title, setTitle] = useState(initialTitle);
25|  const [menuVisible, setMenuVisible] = useState(false);
26|  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
27|  const [selectedIndex, setSelectedIndex] = useState<number>(0);
28|  const [isFocused, setIsFocused] = useState(false);
29|
30|  useEffect(() => {
31|    setTitle(initialTitle);
32|    titleRef.current = initialTitle;
33|  }, [initialTitle]);
34|
35|  const commands: CommandOption[] = [
36|    { label: 'Bold', icon: 'B', action: (editor: any) => editor.chain().focus().toggleBold().run() },
37|    { label: 'Italic', icon: 'I', action: (editor: any) => editor.chain().focus().toggleItalic().run() },
38|    { label: 'Heading 1', icon: 'H1', action: (editor: any) => editor.chain().focus().setHeading({ level: 1 }).run() },
39|    { label: 'Heading 2', icon: 'H2', action: (editor: any) => editor.chain().focus().setHeading({ level: 2 }).run() },
40|    { label: 'Bullet List', icon: '•', action: (editor: any) => editor.chain().focus().toggleBulletList().run() },
41|  ];
42|
43|  const editor = useEditor({\n44|    extensions: [\n45|      StarterKit,\n46|      Placeholder.configure({\n47|        placeholder: 'Zapisz swoje myśli... / - menu podręczne',\n48|      }),\n49|    ],\n50|    content: initialContent,\n51|    onUpdate: ({ editor }) => {\n52|      onUpdate({ 
53|        title: title || titleRef.current, \
54|        content: editor.getHTML() \
55|      });\n56|    },\n57|  }, []);
58|
59|  useEffect(() => {\n60|    if (editor && initialContent !== editor.getHTML()) {\n61|      editor.commands.setContent(initialContent, false);\n62|    }\
63|  }, [initialContent, editor]);
64|
65|  const safeHandleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n66|    const val = e.target.value;\n67|    setTitle(val);\
68|    titleRef.current = val;\
69|    if (editor) {\n70|      onUpdate({ title: val, content: editor.getHTML() });\n71|    }\n72|  };\
73|
74|  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {\n75|    if (!editor) return;\n76|    const { key } = event;\n77|
78|    if (key === '/') {\n79|      // Remove the slash character from the editor content immediately\
80|      editor.commands.deleteRange({ from: editor.state.selection.from, to: editor.state.selection.from + 1 });\n81|      \n82|      setTimeout(() => {\n83|        setMenuPosition({ top: 40, left: 40 }); \
84|        setMenuVisible(true);\
85|        setSelectedIndex(0);\
86|      }, 0);\
87|      return;\n88|    }\n89|
90|    if (menuVisible) {\n91|      if (key === 'ArrowDown') {\n92|        event.preventDefault();\
93|        setSelectedIndex((prev) => (prev + 1) % commands.length);\n94|        return;\n95|      }\n96|      if (key === 'ArrowUp') {\n97|        event.preventDefault();\
98|        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);\
99|        return;\
100|      }\n101|      if (key === 'Enter') {\n102|        event.preventDefault();\
103|        commands[selectedIndex].action(editor);\n104|        setMenuVisible(false);\n105|        return;\n106|      }\
107|      if (key === 'Escape') {\n108|        event.preventDefault();\
109|        setMenuVisible(false);\n110|        return;\n111|      }\n112|    }\n113|  }, [editor, menuVisible, selectedIndex, commands]);
114|
115|  const setSelectedIndex = (fn: (prev: number) => number) => {\n116|     setSelectedIndex(fn);\n117|  };\
118|
119|  useEffect(() => {\n120|    const clickHandler = () => setMenuVisible(false);\n121|    window.addEventListener('click', clickHandler);\n122|    return () => window.removeEventListener('click', clickHandler);\n123|  }, []);
124|
125|  if (!editor) return null;\
126|
127|  // Logic for Ghost Text behavior\n128|  const isDefaultText = title === 'Nowy Dokument';\n129|  const titleTextColor = (isFocused || !isDefaultText) ? 'text-slate-900' : 'text-slate-200';\
130|  const titleFontWeight = (isFocused || !isDefaultText) ? 'font-bold' : 'font-normal';
131|
132|  return (\n133|    <div className=\"flex flex-col w-full gap-6\" onKeyDown={handleKeyDown}>\n134|      <div className=\"border-b border-slate-100 pb-4\">\n135|        <input\
136|          type=\"text\"\
137|          value={title}\
138|          onChange={safeHandleTitleChange}\n139|          onFocus={() => setIsFocused(true)}\
140|          onBlur={() => setIsFocused(false)}\
141|          className={`w-full text-4xl ${titleTextColor} ${titleFontWeight} bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 transition-colors duration-200`}\
142|          placeholder=\"Tytuł artykułu...\"\
143|        />\
144|      </div>\
145|
146|      <div className=\"prose prose-slate max-w-none outline-none border-bottom border-none ring-0 focus:outline-none focus:ring-0 focus:border-none [&_.tiptap-placeholder]:text-slate-400 [&_.tiptap-placeholder]:opacity-100\">\n147|        <EditorContent editor={editor} />\
148|      </div>\
149|
150|      {menuVisible && (\n151|        <div \n152|          role=\"menu\"\
153|          className=\"absolute z-50 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 w-56 overflow-hidden\"\
154|          style={{ top: menuPosition.top, left: menuPosition.left }}\
155|          onClick={(e) => e.stopPropagation()}\
156|        >\n157|          {commands.map((cmd, index) => (\n158|            <button\
159|              key={cmd.label}\
160|              onMouseEnter={() => setSelectedIndex(index)}\
161|              onClick={(e) => {\n162|                e.preventDefault();\n163|                cmd.action(editor);\n164|                setMenuVisible(false);\n165|              }}\
166|              className={`w-full flex items-center gap-3 text-left px-4 py-2 text-sm transition-colors ${\n167|                index === selectedIndex ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'\n168|              }`}\
169|            >\
170|              <span className=\"w-6 h-6 flex items-center justify-center bg-slate-200 rounded text-[10px] font-bold\">{cmd.icon}</span\
171|              {cmd.label}\
172|             </button>\
173|          ))}\
174|        </div>\
175|      )}\
176|    </div>\
177|  );\
178|};\
179|
180|export default VellumEditor;
