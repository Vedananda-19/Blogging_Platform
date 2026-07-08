import { EditorContent, useCurrentEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useEffect, useState, type ReactNode } from "react";
import {
    LuBold,
    LuItalic,
    LuUnderline,
    LuStrikethrough,
    LuCode,
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuList,
    LuListOrdered,
    LuQuote,
    LuSquareCode,
    LuMinus,
    LuUndo2,
    LuRedo2,
    LuImagePlus,
} from "react-icons/lu";
import FileUpload from "./FileUpload";

type BtnProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: ReactNode;
};

const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
}: BtnProps) => (
    <button
        type="button"
        title={title}
        className={`tbButton${active ? " tbActive" : ""}`}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
    >
        {children}
    </button>
);

const Divider = () => <span className="tbDivider" />;

const Toolbar = ({ editor }: { editor: Editor }) => {
    const s = useEditorState({
        editor,
        selector: ({ editor }) => ({
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            code: editor.isActive("code"),
            h1: editor.isActive("heading", { level: 1 }),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            codeBlock: editor.isActive("codeBlock"),
            image: editor.isActive("image"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
        }),
    });

    const chain = () => editor.chain().focus();

    const [imageURL, setImageURL] = useState("");
    const [uploadDisplay, setUploadDisplay] = useState(false);

    useEffect(() => {
        imageURL && chain().setImage({ src: imageURL }).run();
    }, [imageURL]);

    return (
        <div className="editorToolbar">
            <FileUpload
                setDisplay={setUploadDisplay}
                setImageURL={setImageURL}
            />
            <ToolbarButton
                title="Bold"
                active={s?.bold}
                onClick={() => chain().toggleBold().run()}
            >
                <LuBold />
            </ToolbarButton>
            <ToolbarButton
                title="Italic"
                active={s?.italic}
                onClick={() => chain().toggleItalic().run()}
            >
                <LuItalic />
            </ToolbarButton>
            <ToolbarButton
                title="Underline"
                active={s?.underline}
                onClick={() => chain().toggleUnderline().run()}
            >
                <LuUnderline />
            </ToolbarButton>
            <ToolbarButton
                title="Strikethrough"
                active={s?.strike}
                onClick={() => chain().toggleStrike().run()}
            >
                <LuStrikethrough />
            </ToolbarButton>
            <ToolbarButton
                title="Inline code"
                active={s?.code}
                onClick={() => chain().toggleCode().run()}
            >
                <LuCode />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                title="Heading 1"
                active={s?.h1}
                onClick={() => chain().toggleHeading({ level: 1 }).run()}
            >
                <LuHeading1 />
            </ToolbarButton>
            <ToolbarButton
                title="Heading 2"
                active={s?.h2}
                onClick={() => chain().toggleHeading({ level: 2 }).run()}
            >
                <LuHeading2 />
            </ToolbarButton>
            <ToolbarButton
                title="Heading 3"
                active={s?.h3}
                onClick={() => chain().toggleHeading({ level: 3 }).run()}
            >
                <LuHeading3 />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                title="Bullet list"
                active={s?.bulletList}
                onClick={() => chain().toggleBulletList().run()}
            >
                <LuList />
            </ToolbarButton>
            <ToolbarButton
                title="Numbered list"
                active={s?.orderedList}
                onClick={() => chain().toggleOrderedList().run()}
            >
                <LuListOrdered />
            </ToolbarButton>
            <ToolbarButton
                title="Quote"
                active={s?.blockquote}
                onClick={() => chain().toggleBlockquote().run()}
            >
                <LuQuote />
            </ToolbarButton>
            <ToolbarButton
                title="Code block"
                active={s?.codeBlock}
                onClick={() => chain().toggleCodeBlock().run()}
            >
                <LuSquareCode />
            </ToolbarButton>
            <ToolbarButton
                title="Divider"
                onClick={() => chain().setHorizontalRule().run()}
            >
                <LuMinus />
            </ToolbarButton>

            <Divider />
            <ToolbarButton
                title="Upload image"
                active={s?.image}
                onClick={() => setUploadDisplay(true)}
            >
                <LuImagePlus />
            </ToolbarButton>
            <Divider />

            <ToolbarButton
                title="Undo"
                disabled={!s?.canUndo}
                onClick={() => chain().undo().run()}
            >
                <LuUndo2 />
            </ToolbarButton>
            <ToolbarButton
                title="Redo"
                disabled={!s?.canRedo}
                onClick={() => chain().redo().run()}
            >
                <LuRedo2 />
            </ToolbarButton>
        </div>
    );
};

const BlogEditor = () => {
    const { editor } = useCurrentEditor();
    if (!editor) return null;

    return (
        <div className="editorShell">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} className="editorContent" />
        </div>
    );
};

export default BlogEditor;
