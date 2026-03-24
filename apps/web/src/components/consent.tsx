import {
  MdCookie,
  MdGavel,
  MdOutlinePrivacyTip,
  MdSecurity,
} from "react-icons/md";

const Privacy = () => {
  return (
    <a
      className="inline-flex items-center gap-2 text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-300"
      href="https://www.iubenda.com/privacy-policy/97069484/full-legal"
      rel="noopener noreferrer"
      target="_blank"
      title="Privacy Policy"
    >
      <MdOutlinePrivacyTip className="h-4 w-4" />
      Privacy Policy
    </a>
  );
};

const Cookies = () => {
  return (
    <a
      className="inline-flex items-center gap-2 text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-300"
      href="https://www.iubenda.com/privacy-policy/97069484/cookie-policy"
      rel="noopener noreferrer"
      target="_blank"
      title="Cookie Policy"
    >
      <MdCookie className="h-4 w-4" />
      Cookie Policy
    </a>
  );
};

const Terms = () => {
  return (
    <a
      className="inline-flex items-center gap-2 text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-300"
      href="https://www.iubenda.com/terms-and-conditions/97069484"
      rel="noopener noreferrer"
      target="_blank"
      title="Terms and Conditions"
    >
      <MdGavel className="h-4 w-4" />
      Terms & Conditions
    </a>
  );
};

const Security = () => {
  return (
    <a
      className="inline-flex items-center gap-2 text-gray-400 transition-colors duration-200 ease-in-out hover:text-gray-300"
      href="/security"
      title="Security - Responsible Disclosure"
    >
      <MdSecurity className="h-4 w-4" />
      Security
    </a>
  );
};

// const PrivacyChoices = () => {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src =
//       '//embeds.iubenda.com/widgets/1a87d6c7-a30f-472c-97ad-dee6e51b6968.js';
//     script.async = true;
//     script.type = 'text/javascript';
//     document.body.appendChild(script);

//     return () => {
//       if (document.body.contains(script)) {
//         document.body.removeChild(script);
//       }
//     };
//   }, []);

//   return (
//     <a
//       href="#"
//       className="text-gray-400 hover:text-gray-300 transition-colors duration-200 ease-in-out inline-flex items-center gap-2 iubenda-cs-preferences-link"
//       title="Your Privacy Choices"
//     >
//       <MdOutlinePrivacyTip className="w-4 h-4" />
//       Your Privacy Choices
//     </a>
//   );
// };

export { Cookies, Privacy, Security, Terms };