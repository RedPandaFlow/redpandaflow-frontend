import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <main className="min-h-screen bg-[#FDFAF6] py-12 px-4 md:px-0">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-block text-2xl font-semibold text-[#EA580C] mb-10"
          style={{ fontFamily: "Georgia, serif" }}
        >
          RedPandaFlow
        </Link>

        <h1
          className="text-3xl font-bold text-[#1C1410] mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          Conditions générales d'utilisation
        </h1>
        <p className="text-sm text-[#9C8170] mb-10">
          Dernière mise à jour&nbsp;: 25 mai 2026
        </p>

        <section className="space-y-3 text-[#1C1410]">
          <h2 className="text-lg font-bold">1. Objet</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Les présentes conditions régissent l'utilisation de RedPandaFlow,
            un service de gestion collaborative de tâches sous forme de
            tableaux. RedPandaFlow est un projet pédagogique réalisé dans le
            cadre d'une formation YNOV (B2) et fourni sans garantie.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">2. Acceptation</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            La création d'un compte vaut acceptation pleine et entière des
            présentes conditions et de la{" "}
            <Link
              to="/confidentialite"
              className="text-[#EA580C] hover:underline"
            >
              politique de confidentialité
            </Link>
            . Si vous n'êtes pas d'accord avec ces conditions, n'utilisez pas
            le service.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">3. Compte utilisateur</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Vous êtes responsable de la confidentialité de votre mot de passe
            et de toutes les actions effectuées depuis votre compte. Vous vous
            engagez à fournir des informations exactes lors de l'inscription.
            Vous pouvez supprimer votre compte à tout moment depuis la page
            Profil.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">4. Utilisation du service</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Vous vous engagez à utiliser le service de manière loyale et à ne
            pas&nbsp;:
          </p>
          <ul className="list-disc pl-5 text-sm text-[#3F2A1F] leading-relaxed space-y-1">
            <li>publier de contenus illégaux, haineux, diffamatoires ou portant atteinte aux droits d'autrui&nbsp;;</li>
            <li>tenter de contourner les mécanismes d'authentification ou d'autorisation&nbsp;;</li>
            <li>perturber le fonctionnement du service ou des autres utilisateurs&nbsp;;</li>
            <li>collecter automatiquement des données depuis le service sans autorisation préalable.</li>
          </ul>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">5. Propriété des contenus</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Vous conservez l'entière propriété des contenus que vous publiez.
            Vous accordez simplement au service le droit technique de les
            stocker et de les afficher aux membres que vous avez invités.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">6. Responsabilité</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            S'agissant d'un projet pédagogique, le service est fourni «&nbsp;en
            l'état&nbsp;» sans garantie de disponibilité, d'absence d'erreurs
            ni de conservation des données. Vous êtes invité à exporter
            régulièrement vos contenus importants.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">7. Suspension et clôture</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            En cas de violation des présentes conditions, le compte concerné
            pourra être suspendu ou supprimé sans préavis.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">8. Modifications</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Les présentes conditions peuvent être modifiées à tout moment. La
            date de dernière mise à jour figure en haut de cette page. La
            poursuite de l'utilisation du service après modification vaut
            acceptation des nouvelles conditions.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8 pb-12">
          <h2 className="text-lg font-bold">9. Droit applicable</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Les présentes conditions sont régies par le droit français. Pour
            toute question, vous pouvez contacter{" "}
            <a
              href="mailto:nathanferre06@gmail.com"
              className="text-[#EA580C] hover:underline"
            >
              nathanferre06@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
};

export default Terms;
