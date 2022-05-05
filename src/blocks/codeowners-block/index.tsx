import { FileBlockProps } from "@githubnext/utils";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { BlockInner } from "./block-inner";

export default function (props: FileBlockProps) {
  const queryClient = new QueryClient();

  if (props.context.path !== "CODEOWNERS") {
    return (
      <div className="p-4">
        <p className="text-sm">
          Sorry, but this block only works on{" "}
          <span className="text-mono">CODEOWNERS</span> files.
        </p>
      </div>
    );
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BlockInner {...props} />
      </QueryClientProvider>
      <Toaster />
    </>
  );
}
