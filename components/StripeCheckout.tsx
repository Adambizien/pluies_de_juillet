"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface StripeCheckoutProps {
  eventId: number;
  eventPrice: number;
  eventTitle: string;
  isAlreadyRegistered: boolean;
}

export function StripeCheckout({ eventId, eventPrice, isAlreadyRegistered }: StripeCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const isSuccess = searchParams.get("success");
  const isCanceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (isSuccess && sessionId && !confirming) {
      setConfirming(true);
      fetch("/api/stripe/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setConfirming(false);
            setTimeout(() => router.replace(window.location.pathname), 3000);
          }
        })
        .catch((err) => {
          console.error("Erreur confirmation:", err);
          setConfirming(false);
        });
    }

    if (isSuccess && !sessionId && !confirming) {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        setTimeout(() => router.replace(window.location.pathname), 3000);
      }, 3000);
    }
  }, [isSuccess, sessionId]);

  useEffect(() => {
    if (isCanceled) {
      const timer = setTimeout(() => {
        router.replace(window.location.pathname);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCanceled]);

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mt-4">
        <p className="text-green-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
          {confirming ? (
            <>
              <svg className="w-5 h-5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirmation de votre inscription...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Inscription confirmée !
            </>
          )}
        </p>
        <p className="text-green-700 text-xs sm:text-sm mt-1">
          {confirming ? "Veuillez patienter..." : "Votre inscription a été enregistrée avec succès."}
        </p>
      </div>
    );
  }

  if (isAlreadyRegistered) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-6">
        <p className="text-blue-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Vous êtes déjà inscrit à cet événement
        </p>
        <p className="text-blue-700 text-xs sm:text-sm mt-1">Vous pouvez consulter vos inscriptions dans votre profil.</p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Link
            href="/planning"
            className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Voir ma planification
          </Link>
          <Link
            href="/historique"
            className="inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Voir mon historique
          </Link>
        </div>

      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du paiement");
      }

      if (data.free) {
        window.location.href = `/events/${eventId}?success=true`;
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (isCanceled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4">
        <p className="text-yellow-800 font-semibold flex items-center gap-2 text-xs sm:text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Paiement annulé
        </p>
        <p className="text-yellow-700 text-xs sm:text-sm mt-1">Attendez un instant, le bouton de paiement va réapparaître...</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-red-800 text-xs sm:text-sm">{error}</p>
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-colors"
      >
        {loading ? "Traitement..." : eventPrice === 0 ? "S'inscrire gratuitement" : `S'inscrire (${(eventPrice / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €)`}
      </button>
    </div>
  );
}
