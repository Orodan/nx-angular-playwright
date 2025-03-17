import { execSync } from 'child_process';
import { platform } from 'os';

// Permet d'assurer que la baseUrl pour Playwright sera correct, que les tests soient exécuté depuis
// des navigateurs locaux où dans un container.
export const getHostIP = () => {
  try {
    if (platform() === 'darwin') {
      // macOS : Trouver l'IP locale
      return execSync(
        "ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}'"
      )
        .toString()
        .split('\n')[0]
        .trim();
    } else if (platform() === 'linux') {
      // Linux (Ubuntu, Debian...) : Trouver l'IP locale
      return execSync("hostname -I | awk '{print $1}'").toString().trim();
    } else if (platform() === 'win32') {
      // Windows : Trouver l'IP locale
      return execSync(
        'powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -NotLike \'Loopback*\'}).IPAddress | Select-Object -First 1"'
      )
        .toString()
        .trim();
    } else {
      throw new Error(`OS non supporté: ${platform()}`);
    }
  } catch (e) {
    console.error("Erreur lors de la récupération de l'IP de l'hôte", e);
    process.exit(1);
  }
};
