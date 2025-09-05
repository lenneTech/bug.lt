import type { AttachmentFile } from '../types/index.js';
interface Props {
    attachments: AttachmentFile[];
    disabled?: boolean;
    maxFileSize?: number;
    allowedTypes?: string[];
}
declare const _default: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    add: (files: AttachmentFile[]) => any;
    remove: (id: string) => any;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onAdd?: ((files: AttachmentFile[]) => any) | undefined;
    onRemove?: ((id: string) => any) | undefined;
}>, {
    disabled: boolean;
    maxFileSize: number;
    allowedTypes: string[];
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
