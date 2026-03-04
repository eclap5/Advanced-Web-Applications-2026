type Props = {
    message: string;
    variant?: "info" | "success" | "error";
};

export default function StatusBanner({ message, variant = "info" }: Readonly<Props>) {
    if (!message) return null;

    return (
        <div className={`status status-${variant}`}>
            {message}
        </div>
    );
}