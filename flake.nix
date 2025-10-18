{
  description = "NixOS environment";

  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11"; };

  outputs = { self, nixpkgs, }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell.${system} = with pkgs;
        mkShell {
          packages = [
            nodejs_22
            yarn
            nodePackages.typescript
            nodePackages.typescript-language-server
            openssl
            pkg-config
            pre-commit
          ];
        };
    };
}
