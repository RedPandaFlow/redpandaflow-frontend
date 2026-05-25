import { Link } from "react-router-dom";

const Privacy = () => {
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
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[#9C8170] mb-10">
          Dernière mise à jour&nbsp;: 25 mai 2026
        </p>

        <section className="space-y-3 text-[#1C1410]">
          <h2 className="text-lg font-bold">Responsable du traitement</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            RedPandaFlow est un projet pédagogique réalisé dans le cadre d'une
            formation YNOV (B2). Le responsable du traitement des données est
            Nathan Ferre, joignable à l'adresse{" "}
            <a
              href="mailto:nathanferre06@gmail.com"
              className="text-[#EA580C] hover:underline"
            >
              nathanferre06@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">Données collectées</h2>
          <ul className="list-disc pl-5 text-sm text-[#3F2A1F] leading-relaxed space-y-1">
            <li>Adresse email et nom d'utilisateur (compte)</li>
            <li>Mot de passe (stocké sous forme de hash bcrypt, jamais en clair)</li>
            <li>Biographie et URL d'avatar si renseignés</li>
            <li>
              Contenus que vous créez&nbsp;: espaces de travail, tableaux,
              cartes, commentaires, listes
            </li>
            <li>
              Cookies de session strictement nécessaires (jetons d'authentification
              HttpOnly) — aucun cookie de mesure d'audience ou publicitaire
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">Finalités et base légale</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Ces données sont traitées exclusivement pour fournir le service de
            gestion collaborative de tâches&nbsp;: authentification, partage
            d'espaces de travail entre membres invités, persistance de vos
            contenus. La base légale est l'exécution du contrat qui vous lie au
            service (article 6.1.b du RGPD).
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">Destinataires</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Vos données ne sont transmises à aucun tiers. Les contenus que vous
            créez sont uniquement visibles par les utilisateurs que vous avez
            explicitement invités dans vos espaces de travail ou tableaux.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">Durée de conservation</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Vos données sont conservées tant que votre compte est actif. Lorsque
            vous supprimez votre compte, vos données personnelles sont
            effacées et vos commentaires sont anonymisés afin de préserver le
            fil des discussions auxquelles d'autres utilisateurs ont participé.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8">
          <h2 className="text-lg font-bold">Vos droits</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Conformément au RGPD, vous disposez d'un droit d'accès, de
            rectification, d'effacement, de portabilité, d'opposition et de
            limitation du traitement de vos données.
          </p>
          <ul className="list-disc pl-5 text-sm text-[#3F2A1F] leading-relaxed space-y-1">
            <li>
              <strong>Accès et rectification&nbsp;:</strong> via la page{" "}
              <Link to="/profile" className="text-[#EA580C] hover:underline">
                Profil
              </Link>
              .
            </li>
            <li>
              <strong>Effacement&nbsp;:</strong> via le bouton «&nbsp;Supprimer
              mon compte&nbsp;» dans la Zone de danger de votre profil.
            </li>
            <li>
              <strong>Portabilité, opposition, limitation&nbsp;:</strong> sur
              demande à l'adresse de contact ci-dessus.
            </li>
          </ul>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Vous disposez également du droit d'introduire une réclamation auprès
            de la CNIL (
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noreferrer"
              className="text-[#EA580C] hover:underline"
            >
              www.cnil.fr
            </a>
            ) si vous estimez que vos droits ne sont pas respectés.
          </p>
        </section>

        <section className="space-y-3 text-[#1C1410] mt-8 pb-12">
          <h2 className="text-lg font-bold">Modifications</h2>
          <p className="text-sm text-[#3F2A1F] leading-relaxed">
            Cette politique peut être mise à jour. La date de dernière
            modification figure en haut de cette page.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Privacy;
