/* eslint-disable @typescript-eslint/no-unused-vars */
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { WebsocketProvider } from "y-websocket";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { type EditorState } from "lexical";
import { type Provider } from "@lexical/yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider, HocuspocusProviderWebsocket, TiptapCollabProvider } from "@hocuspocus/provider";

// @TODO: REPLACE APP ID
const providerWebsocket = new HocuspocusProviderWebsocket({
  url:  `wss://YOUR_APP_ID.collab.tiptap.cloud`,
})

export default function Editor({
  initialEditorState,
  noteId,
}: {
  initialEditorState: string | null;
  noteId: string;
}) {
  const saveEditorState = (editorState: EditorState) => {
    console.log("saving editor state", noteId);
    localStorage.setItem(noteId, JSON.stringify(editorState));
  };

  return (
    <LexicalComposer
      key={noteId}
      initialConfig={{
        editorState: null,
        namespace: "test",
        onError: (error: Error) => console.log(error),
      }}
    >
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CollaborationPlugin
        id={noteId}
        providerFactory={createWebsocketProvider}
        initialEditorState={initialEditorState}
        shouldBootstrap={true}
      />
      <OnChangePlugin onChange={saveEditorState} ignoreSelectionChange />
    </LexicalComposer>
  );
}

function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>
): Provider {
  const doc = new Y.Doc();
  yjsDocMap.set(id, doc);

// @TODO: REPLACE APP ID
// @TODO: PUT PROPER TOKEN
  const hocuspocusProvider = new TiptapCollabProvider({
    appId: 'YOUR_APP_ID',
    name: `lexical-${id}`,
    token: 'YOUR_TOKEN',
    document: doc,
    websocketProvider: providerWebsocket,
  });

  window.provider = hocuspocusProvider

  hocuspocusProvider.on("sync", () => console.log("hocuspocus"));

  // return {
  //   connect() {
  //     wsProvider.connect();
  //     hocuspocusProvider.connect();
  //   },

  //   disconnect() {
  //     wsProvider.connect();
  //   },

  //   on(event, callback) {
  //     // ...
  //   },

  //   off(event, callback) {
  //     // ...
  //   },

  //   // idbProvider does not do anything with awareness
  //   awareness: wsProvider.awareness,
  // }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return hocuspocusProvider;
}
