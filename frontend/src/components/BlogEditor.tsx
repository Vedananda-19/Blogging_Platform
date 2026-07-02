import {
    useEditor,
    EditorContent,
    useCurrentEditor,
    useEditorState,
} from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import { useMemo } from "react";

const BlogEditor = () => {
    const {editor} = useCurrentEditor()

    //A Selected editor object derived from object to avoid unnecessary re-renders
    const editorState = useEditorState({editor/*When it changes*/,selector:({editor}) => {
        if (!editor) return null
        return {
            isEditable: editor.isEditable,
            currentSelection: editor.state.selection,
            currentContent: editor.getJSON()
        }
    }})
    return (
        <div>
                <EditorContent editor={editor}/>
                <FloatingMenu editor={editor}>
                    This is the floating menu
                </FloatingMenu>
                <BubbleMenu editor={editor||undefined}>This is the Bubble menu</BubbleMenu>
                <pre>{JSON.stringify(editorState?.currentContent, null, 2)}</pre>
        </div>
    );
};

export default BlogEditor;
