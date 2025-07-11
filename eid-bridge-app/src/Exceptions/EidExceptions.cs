namespace OphtalmoPro.EidBridge
{
    // Exceptions personnalisées
    public class MiddlewareException : Exception
    {
        public MiddlewareException(string message) : base(message) { }
        public MiddlewareException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class CardNotPresentException : Exception
    {
        public CardNotPresentException(string message) : base(message) { }
    }
}