# ~/.profile — atl.sh
# Executed by login shells

if [ -n "$BASH_VERSION" ] && [ -f "$HOME/.bashrc" ]; then
    . "$HOME/.bashrc"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi

# Ensure XDG_RUNTIME_DIR is set for user services
if [ -z "$XDG_RUNTIME_DIR" ]; then
    export XDG_RUNTIME_DIR=/run/user/$(id -u)
fi

if [ -d "$HOME/bin" ]; then
    PATH="$HOME/bin:$PATH"
fi

# NPM and Gem sandboxing PATHs
export PATH="$HOME/.npm-packages/bin:$PATH"
export NODE_PATH="$HOME/.npm-packages/lib/node_modules"
export NPM_CONFIG_PREFIX="$HOME/.npm-packages"
