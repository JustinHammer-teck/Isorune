{
  description = "Flake for Isorune";
  inputs.nixpkgs-unstable.url = "github:nixos/nixpkgs/nixos-unstable";
  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-unstable,
      ...
    }@inputs:

    let

      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import inputs.nixpkgs {
              inherit system;
              config.allowUnfree = true;
            };
            pkgs-unstable = import inputs.nixpkgs-unstable {
              inherit system;
              config.allowUnfree = true;
            };
          }
        );

    in
    {
      devShells = forEachSupportedSystem (
        { pkgs, pkgs-unstable }:
        let
          pkgs-dotnet = (
            with pkgs.dotnetCorePackages;
            combinePackages [
              dotnet_9.sdk
              dotnet_8.sdk
            ]
          );
        in
        {
          default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              pkgs-unstable.spacetimedb
              pkgs-dotnet

              csharpier
              roslyn-ls

              nodejs
              vtsls
              pnpm
              prettierd
              eslint_d
            ];
          };

          DOTNET_PATH = "${pkgs-dotnet}/bin/dotnet";
          DOTNET_ROOT = "${pkgs-dotnet}/share/dotnet";
        }
      );
    };
}
