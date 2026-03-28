# ~/.bashrc — atl.sh pubnix default shell config

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000
shopt -s histappend

# Window size
shopt -s checkwinsize

# Prompt
PS1='\[\033[01;32m\]\u\[\033[00m\]@\[\033[01;34m\]atl.sh\[\033[00m\]:\[\033[01;33m\]\w\[\033[00m\]\$ '

# Aliases
alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias grep='grep --color=auto'

# Your web pages live here:
#   Web:    ~/public_html/     → https://atl.sh/~$USER
#   Gemini: ~/public_gemini/   → gemini://atl.sh/~$USER
#   Gopher: ~/public_gopher/   → gopher://atl.sh/~$USER
