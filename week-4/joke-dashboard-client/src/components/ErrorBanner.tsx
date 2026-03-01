type Props = {
    message: string;
};

export default function ErrorBanner({ message }: Props) {
    return (
        <div className="card error">
            <strong>Error:</strong> {message}
        </div>
    );
}