# -*- mode: ruby -*-
# atl.sh — local dev VM for Ansible testing
# Usage: vagrant up && just deploy dev
# Prerequisite: ssh-keygen -f .ssh/dev_key -t ed25519 -N "" (creates key pair for root SSH)

Vagrant.configure("2") do |config|
  unless File.exist?(".ssh/dev_key.pub")
    raise "Missing .ssh/dev_key.pub. Create it with: mkdir -p .ssh && ssh-keygen -f .ssh/dev_key -t ed25519 -N \"\""
  end

  config.vm.box = "debian/trixie64"
  config.vm.hostname = "atl-sh-dev"

  # Disable synced folders — Ansible runs from host over SSH; no project files needed in VM
  config.vm.synced_folder ".", "/vagrant", disabled: true

  config.vm.provider "libvirt" do |v, override|
    v.memory = 4096
    v.cpus = 4
    # Add ssh forward — libvirt skips default id "ssh"; use id "ssh_lh" and port 2223 to avoid duplicate with Vagrant's 2222
    override.vm.network "forwarded_port", guest: 22, host: 2223, host_ip: "127.0.0.1", id: "ssh_lh"
  end

  # Provision root SSH access for Ansible
  config.vm.provision "file", source: ".ssh/dev_key.pub", destination: "/tmp/authorized_keys.pub"
  config.vm.provision "shell", privileged: true, inline: <<-SHELL
    mkdir -p /root/.ssh
    mv /tmp/authorized_keys.pub /root/.ssh/authorized_keys
    chown root:root /root/.ssh /root/.ssh/authorized_keys
    chmod 700 /root/.ssh
    chmod 600 /root/.ssh/authorized_keys
    sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
    systemctl reload sshd 2>/dev/null || service ssh reload 2>/dev/null || true
  SHELL
end
