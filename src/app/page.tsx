'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

// Кастомное расширение для картинки с возможностью изменения размера
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`,
          }
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attributes => {
          return {
            'data-align': attributes.align,
            style: `display: block; margin: ${
                attributes.align === 'center' ? '0 auto' :
                    attributes.align === 'left' ? '0 auto 0 0' : '0 0 0 auto'
            }`,
          }
        },
      }
    }
  },
});

export default function TipTapDemo() {
  const [htmlContent, setHtmlContent] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setForceRender] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('tiptap-demo-content');
    if (saved) {
      setHtmlContent(saved);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      CustomImage.configure({
        HTMLAttributes: {
          class: 'cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // Подключение плагинов таблиц
      Table.configure({
        resizable: true, // Позволяет изменять ширину колонок мышкой
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full text-sm my-4 border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-bold text-left min-w-[100px]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 min-w-[100px]',
        },
      }),
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      localStorage.setItem('tiptap-demo-content', html);
    },
    onSelectionUpdate: () => {
      setForceRender(prev => !prev);
    },
    editorProps: {
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target && target.nodeName === 'IMG') {
          return false;
        }
        return false;
      },
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] border border-gray-300 p-4 rounded-b-md bg-white overflow-y-auto max-h-[70vh]',
      },
    },
  });

  useEffect(() => {
    if (editor && htmlContent && editor.getHTML() !== htmlContent) {
      editor.commands.setContent(htmlContent);
    }
  }, [editor, htmlContent]);

  if (!isMounted || !editor) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        editor.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImageUrl = () => {
    const url = window.prompt('Введите URL картинки:', 'https://picsum.photos/800/400');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL ссылки:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const clearStorage = () => {
    if (window.confirm('Точно очистить редактор?')) {
      localStorage.removeItem('tiptap-demo-content');
      editor.commands.setContent('');
      setHtmlContent('');
    }
  };

  const isImageSelected = editor.isActive('image');
  const isTableActive = editor.isActive('table');

  return (
      <div className="min-h-screen bg-gray-50 text-black py-10">
        <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Демонстрация TipTap</h1>
            <button onClick={clearStorage} className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 shadow-sm transition-colors">
              Очистить всё
            </button>
          </div>

          <div className="sticky top-0 z-20 shadow-md rounded-t-lg overflow-hidden border border-gray-300 border-b-0">

            <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-3">

              <div className={`flex gap-1 bg-white p-1 rounded border border-gray-200 transition-opacity ${isImageSelected ? 'opacity-40 pointer-events-none' : ''}`}>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200 font-bold text-blue-600' : ''}`} title="Жирный">B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded hover:bg-gray-100 italic ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : ''}`} title="Курсив">I</button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-2 py-1 rounded hover:bg-gray-100 line-through ${editor.isActive('strike') ? 'bg-gray-200 text-blue-600' : ''}`} title="Зачеркнутый">S</button>
              </div>

              <div className={`flex gap-1 bg-white p-1 rounded border border-gray-200 transition-opacity ${isImageSelected ? 'opacity-40 pointer-events-none' : ''}`}>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 rounded hover:bg-gray-100 font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : ''}`}>H2</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1 rounded hover:bg-gray-100 font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-blue-600' : ''}`}>H3</button>
                <button onClick={() => editor.chain().focus().setParagraph().run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive('paragraph') ? 'bg-gray-200 text-blue-600' : ''}`}>Текст</button>
              </div>

              <div className={`flex gap-1 bg-white p-1 rounded border border-gray-200 transition-opacity ${isImageSelected ? 'opacity-40 pointer-events-none' : ''}`}>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : ''}`}>• Список</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : ''}`}>1. Список</button>
              </div>

              <div className={`flex gap-1 bg-white p-1 rounded border border-gray-200 transition-opacity ${isImageSelected ? 'opacity-40 pointer-events-none' : ''}`}>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-blue-600' : ''}`} title="По левому краю">⬅</button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-blue-600' : ''}`} title="По центру">↔</button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-blue-600' : ''}`} title="По правому краю">➡</button>
                <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`px-2 py-1 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 text-blue-600' : ''}`} title="По ширине">≡</button>
              </div>

              <div className={`flex gap-1 bg-white p-1 rounded border border-gray-200 transition-opacity ${isImageSelected ? 'opacity-40 pointer-events-none' : ''}`}>
                <button onClick={setLink} className={`px-3 py-1.5 rounded bg-white hover:bg-gray-50 transition-opacity ${editor.isActive('link') ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>🔗 Ссылка</button>
                <button
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className={`px-3 py-1.5 rounded hover:bg-gray-50 transition-colors border-l border-gray-200 ${isTableActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'}`}
                    title="Вставить таблицу 3x3"
                >
                  📊 Таблица
                </button>
              </div>

              <div className={`ml-auto flex gap-1 items-center bg-white p-1 rounded border border-gray-200 transition-opacity`}>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                    title="Загрузить с устройства"
                >
                  🖼 Загрузить
                </button>
                <button
                    onClick={addImageUrl}
                    className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
                    title="Вставить по ссылке"
                >
                  URL
                </button>
              </div>
            </div>

            {/* Панель настроек картинки */}
            <div className={`transition-all duration-300 origin-top overflow-hidden bg-blue-50 ${isImageSelected ? 'max-h-16 border-t border-blue-200 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex h-12 gap-2 items-center px-4">
                <span className="text-sm text-blue-800 font-semibold pr-2 border-r border-blue-200">Настройки картинки:</span>

                <div className="flex gap-1 items-center">
                  <span className="text-xs text-blue-600 ml-2 mr-1">Размер:</span>
                  <button onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()} className={`px-3 py-1 text-sm rounded border transition-all ${editor.getAttributes('image').width === '50%' ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white hover:bg-blue-100 border-blue-200 text-gray-700'}`}>50%</button>
                  <button onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()} className={`px-3 py-1 text-sm rounded border transition-all ${editor.getAttributes('image').width === '100%' || !editor.getAttributes('image').width ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white hover:bg-blue-100 border-blue-200 text-gray-700'}`}>100%</button>
                </div>

                <div className="flex gap-1 items-center ml-4">
                  <span className="text-xs text-blue-600 mr-1">Выравнивание:</span>
                  <button onClick={() => editor.chain().focus().updateAttributes('image', { align: 'left' }).run()} className={`px-3 py-1 text-sm rounded border transition-all ${editor.getAttributes('image').align === 'left' ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white hover:bg-blue-100 border-blue-200 text-gray-700'}`}>Слева</button>
                  <button onClick={() => editor.chain().focus().updateAttributes('image', { align: 'center' }).run()} className={`px-3 py-1 text-sm rounded border transition-all ${editor.getAttributes('image').align === 'center' || !editor.getAttributes('image').align ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white hover:bg-blue-100 border-blue-200 text-gray-700'}`}>По центру</button>
                </div>
              </div>
            </div>

            {/* Панель настроек ТАБЛИЦЫ */}
            <div className={`transition-all duration-300 origin-top overflow-hidden bg-green-50 ${isTableActive ? 'max-h-16 border-t border-green-200 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex h-12 gap-4 items-center px-4 overflow-x-auto whitespace-nowrap">
                <span className="text-sm text-green-800 font-semibold pr-2 border-r border-green-300 shrink-0">Таблица:</span>

                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-green-300 rounded text-green-800">+ Столбец до</button>
                  <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-green-300 rounded text-green-800">+ Столбец после</button>
                  <button onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700">Удалить столбец</button>
                </div>

                <div className="w-px h-6 bg-green-300 shrink-0"></div>

                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editor.chain().focus().addRowBefore().run()} className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-green-300 rounded text-green-800">+ Строка до</button>
                  <button onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-green-300 rounded text-green-800">+ Строка после</button>
                  <button onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700">Удалить строку</button>
                </div>

                <div className="w-px h-6 bg-green-300 shrink-0"></div>

                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editor.chain().focus().mergeCells().run()} className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-green-300 rounded text-green-800">Объединить</button>
                  <button onClick={() => editor.chain().focus().splitCell().run()} className="px-2 py-1 text-xs bg-white hover:bg-green-100 border border-green-300 rounded text-green-800">Разделить</button>
                </div>

                <div className="ml-auto pl-4 shrink-0">
                  <button onClick={() => editor.chain().focus().deleteTable().run()} className="px-3 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded shadow-sm">Удалить таблицу</button>
                </div>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
          .ProseMirror-selectednode {
            outline: 4px solid #3b82f6 !important;
            outline-offset: 2px;
            border-radius: 0.5rem;
            transition: outline 0.1s ease-in-out;
            filter: brightness(1.05);
            box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.3);
          }
          .ProseMirror-focused {
            outline: none !important;
          }
          
          /* Стили для таблицы (внутри редактора) */
          .ProseMirror table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 1.5rem 0;
            overflow: hidden;
            border: 1px solid #d1d5db;
          }
          .ProseMirror td, .ProseMirror th {
            min-width: 1em;
            border: 1px solid #d1d5db;
            padding: 0.5rem;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
          }
          .ProseMirror th {
            background-color: #f3f4f6;
            font-weight: bold;
            text-align: left;
          }
          .ProseMirror .column-resize-handle {
            background-color: #3b82f6;
            bottom: -2px;
            position: absolute;
            right: -2px;
            pointer-events: none;
            top: 0;
            width: 4px;
          }
          .ProseMirror .selectedCell:after {
            background: rgba(59, 130, 246, 0.2);
            content: "";
            left: 0; right: 0; top: 0; bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
          }
        `}} />

          <EditorContent editor={editor} />

          <div className="mt-12 pt-8 border-t border-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Предпросмотр на сайте</h2>
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm min-h-[200px] overflow-x-auto">
              {/* Добавляем класс prose-td и prose-th чтобы Tailwind корректно отображал таблицы на клиенте */}
              <div className="prose prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-th:border prose-th:border-gray-300 prose-th:p-3 prose-th:bg-gray-100 max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-400">Начните писать...</p>' }} />
            </div>
          </div>
        </div>
      </div>
  );
}